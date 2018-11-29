"use strict";
const path = require("path"),
    process = require("process"),
    logger = require(path.join(__dirname, "..", "logger")),
    Writable = require("stream")
        .Writable,
    Transform = require("stream")
        .Transform,
    quantile = require("compute-quantile"),
    Promise = require("bluebird"),
    mean = require("compute-mean");

class CommandTrainingSet {
    run(options) {
        if (!options.training) {
            throw new Error("Training set is missing");
        }

        if (!options.verbose) {
            logger.level = "error";
        }

        const setStream = this.getSetStream(options.training);
        if (options.stats) {
            this
                .getStatistics(setStream)
                .then(statistics => {
                    process.stdout.write(JSON.stringify(statistics,
                        null, 4));
                    return statistics;
                })
                .catch(error => {
                    throw error;
                });
            return;
        }

        setStream
            .pipe(new Transform({
                writableObjectMode: true,
                readableObjectMode: false,
                transform: (chunk, encoding, callback) => {
                    callback(null, JSON.stringify(chunk) + "\n");
                }
            }))
            .pipe(process.stdout);
    }

    getSetStream(training) {
        const set = new(require(path.join(__dirname, "..",
            "trainingsets",
            training)));
        return set.getStream();
    }

    getStatistics(setStream) {
        return new Promise((resolve, reject) => {
            try {
                const classes = new Map(),
                    writable = new Writable({
                        "objectMode": true,
                        "write": (chunk, encoding, callback) => {
                            let previous = classes.get(
                                chunk.class);
                            if (!previous) {
                                previous = 0;
                            }
                            classes.set(chunk.class,
                                previous + 1);
                            callback();
                        }
                    });
                writable.on("error", (error) => {
                    reject(error);
                });
                writable.on("finish", () => {
                    const values = Array.from(classes.values()),
                        keys = Array.from(classes.keys()),
                        frequencies = keys.sort((first,
                            second) => {
                            const firstFreq = classes.get(
                                    first),
                                secondFreq = classes.get(
                                    second);
                            if (firstFreq > secondFreq) {
                                return -1;
                            } else if (firstFreq <
                                secondFreq) {
                                return 1;
                            }
                            return 0;
                        })
                            .map(classification => {
                                return [classification,
                                    classes.get(
                                        classification)
                                ];
                            });
                    resolve({
                        "documents": {
                            count: values.reduce((
                                acc, value) => {
                                return acc +
                                    value;
                            })
                        },
                        "classes": {
                            count: keys.length,
                            "max": Math.max(...
                            values),
                            "min": Math.min(...
                            values),
                            "mean": mean(values),
                            "1th-quartile": quantile(
                                values, 0.25),
                            "2th-quartile": quantile(
                                values, 0.5),
                            "3rd-quartile": quantile(
                                values, 0.75),
                            "frequencies": frequencies
                        }
                    });
                });
                setStream.pipe(writable);
            } catch (error) {
                return reject(error);
            }
        });
    }
}

module.exports = CommandTrainingSet;

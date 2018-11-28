"use strict";

const path = require("path"),
    StringTransform = require(path.join(__dirname, "..", "libraries",
        "string-transform")),
    stringTransform = new StringTransform(),
    Effiliation = require(path.join(__dirname, "..", "libraries", "effiliation")),
    Transform = require("stream")
        .Transform,
    Writable = require("stream")
        .Transform,
    Promise = require("bluebird"),
    logger = require(path.join(__dirname, "..", "logger")),
    quantile = require("compute-quantile"),
    mean = require("compute-mean");

class BrandTrainingSet {

    constructor() {
        this.effiliation = new Effiliation();
    }

    getStatistics() {
        const self = this;
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
                self.getStream()
                    .pipe(writable);
            } catch (error) {
                return reject(error);
            }
        });
    }

    getStream() {
        return this.effiliation.getStreamFromFile(
            path.join(__dirname, "..", "..", "data",
                "effiliation-feed.xml")
        )
            .pipe(new Transform({
                writableObjectMode: true,
                readableObjectMode: true,
                transform: (chunk, encoding, callback) => {
                    const output = {
                        "class": chunk && chunk.brand ?
                            stringTransform.toLowerCase(
                                stringTransform.unaccent(
                                    chunk.brand)) : "",
                        "document": chunk && chunk.extras &&
                            chunk.extras.nom ? chunk.extras
                                .nom : ""
                    };
                    logger.info("trainingset brand transform",
                        output);
                    callback(null, output);
                }
            }));
    }
}
module.exports = BrandTrainingSet;

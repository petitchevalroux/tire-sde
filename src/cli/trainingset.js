"use strict";
const path = require("path"),
    process = require("process"),
    logger = require(path.join(__dirname, "..", "logger")),
    Transform = require("stream")
        .Transform;


module.exports = (options) => {
    if (!options.training) {
        throw new Error("Training set is missing");
    }
    const trainingSet = new(require(path.join(__dirname, "..",
        "trainingsets",
        options.training)));
    if (!options.verbose) {
        logger.level = "error";
    }
    if (options.stats) {
        trainingSet
            .getStatistics()
            .then(statistics => {
                process.stdout.write(JSON.stringify(statistics, null, 4));
                return statistics;
            })
            .catch(error => {
                throw error;
            });
        return;
    }

    trainingSet
        .getStream()
        .pipe(new Transform({
            writableObjectMode: true,
            readableObjectMode: false,
            transform: (chunk, encoding, callback) => {
                callback(null, JSON.stringify(chunk) + "\n");
            }
        }))
        .pipe(process.stdout);
};

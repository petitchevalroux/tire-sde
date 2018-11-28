"use strict";
const path = require("path"),
    process = require("process"),
    logger = require(path.join(__dirname, "..", "logger"));


module.exports = (options) => {
    if (!options.classifier) {
        throw new Error("Classifier is missing");
    }
    if (!options.training) {
        throw new Error("Training set is missing");
    }
    if (!options.verbose) {
        logger.level = "error";
    }
    const classifier = new(require(path.join(__dirname, "..", "classifiers",
            options.classifier)))(),
        trainingSet = new(require(path.join(__dirname, "..", "trainingsets",
            options.training)));

    classifier
        .train(trainingSet.getStream())
        .then(data => {
            return classifier.score(trainingSet.getStream(), data);
        })
        .then(stats => {
            process.write(JSON.stringify(stats));
            return stats;
        })
        .catch(err => {
            throw err;
        });
};

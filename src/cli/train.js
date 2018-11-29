"use strict";
const path = require("path"),
    process = require("process"),
    logger = require(path.join(__dirname, "..", "logger")),
    trainingSetCommand = new(require(path.join(__dirname, "trainingset")))();
class CommandTrain {
    run(options) {
        if (!options.classifier) {
            throw new Error("Classifier is missing");
        }
        if (!options.training) {
            throw new Error("Training set is missing");
        }
        if (!options.verbose) {
            logger.level = "error";
        }
        const classifier = new(require(path.join(__dirname, "..",
            "classifiers",
            options.classifier)))();

        classifier
            .train(trainingSetCommand.getSetStream(options.training))
            .then(data => {
                return classifier.score(trainingSetCommand.getSetStream(
                    options.training), data);
            })
            .then(stats => {
                process.stdout.write(JSON.stringify(stats));
                return stats;
            })
            .catch(err => {
                throw err;
            });
    }

}

module.exports = CommandTrain;

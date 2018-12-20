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

        this.getModel(classifier, options)
            .then(model => {
                return classifier.score(trainingSetCommand.getSetStream(
                    options.training), model)
                    .then((stats) => {
                        return [stats, model];
                    });
            })
            .then(([stats, model]) => {
                process.stdout.write(JSON.stringify(stats));
                if (options.save) {
                    return classifier.save(options.save, model)
                        .then(() => {
                            return stats;
                        });
                }
                return stats;
            })
            .catch(err => {
                throw err;
            });
    }

    getModel(classifier, options) {
        if (options.load) {
            return classifier.load(options.load);
        }
        return classifier
            .train(
                trainingSetCommand.getSetStream(options.training),
                options.maxIterations ? options.maxIterations : 0,
                options.minImprovement ? options.minImprovement : 0
            );
    }

}

module.exports = CommandTrain;

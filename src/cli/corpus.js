"use strict";
const fs = require("fs"),
    path = require("path"),
    WritableStream = require("stream")
        .Writable,
    Promise = require("bluebird"),
    logger = require(path.join(__dirname, "..", "logger")),
    process = require("process"),
    lowerCase = require("@petitchevalroux/string-lower-case"),
    removeNonAlphaNum = require("@petitchevalroux/string-remove-non-alpha-num"),
    removeAccents = require("@petitchevalroux/string-remove-accents");
class CommandCorpus {
    run(options) {
        if (!options.verbose) {
            logger.level = "error";
        }
        const trainingSetPath = path.join(__dirname, "..", "trainingsets"),
            self = this;
        fs.readdir(trainingSetPath, (error, files) => {
            if (error) {
                throw error;
            }
            files.forEach(file => {
                self.handleTrainingSet(require(path.join(
                    trainingSetPath, file)),
                options);
            });
        });
    }

    handleTrainingSet(TrainingSet, options) {
        const readStream = (new TrainingSet())
                .getStream(),
            self = this;
        readStream.pipe(new WritableStream({
            objectMode: true,
            write: (chunk, encoding, callback) => {
                self.handleDocument(chunk.document, options)
                    .then(() => {
                        return callback();
                    })
                    .catch(error => {
                        return callback(error);
                    });
            }
        }));
    }

    handleDocument(document, options) {
        const self = this;
        return new Promise((resolve, reject) => {
            if (options["print-documents"]) {
                process.stdout.write(document + "\n", (error) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve();
                });
            }
            if (options["print-clean"]) {
                process.stdout.write(self.cleanString(document) +
                    "\n", (error) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve();
                });
            }
        });
    }

    cleanString(string) {
        return removeNonAlphaNum(lowerCase(removeAccents(string)));
    }
}

module.exports = CommandCorpus;

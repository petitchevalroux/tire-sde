"use strict";
const fs = require("fs"),
    path = require("path"),
    WritableStream = require("stream")
        .Writable,
    Promise = require("bluebird"),
    logger = require(path.join(__dirname, "..", "logger")),
    process = require("process");
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
        return new Promise((resolve, reject) => {
            if (options["print-documents"]) {
                process.stdout.write(document + "\n", (error) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve();
                });
            }
        });
    }
}

module.exports = CommandCorpus;

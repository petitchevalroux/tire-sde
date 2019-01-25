"use strict";
const Writable = require("stream")
    .Writable,
    NaturalBayesClassifier = require("natural")
    .BayesClassifier,
    Promise = require("bluebird"),
    path = require("path"),
    logger = require(path.join(__dirname, "..", "logger"));
class BayesClassifier {


    /**
     * Classify a document
     * @param {String} document
     * @param {Classifier} classifier
     * @returns {Promise<String>} resulting class
     */
    classify(document, classifier) {
        return new Promise((resolve) => {
            const classification = classifier
                .classify(this.transformDocument(document));
            logger.info("bayes classify", {
                "class": classification,
                document: document
            });
            resolve(classification);
        });
    }



    /**
     * Load classifier data from file file and return classifer
     * @param {string} file
     * @returns {Promise.classifier}
     */
    load(file) {
        return new Promise((resolve, reject) => {
            NaturalBayesClassifier.load(file, null, (error,
                loadedClassifier) => {
                if (error) {
                    return reject(error);
                }
                resolve(loadedClassifier);
            });
        });
    }


    /**
     * Transform document
     * @param {string|array} document
     * @returns {string|array}
     */
    transformDocument(document) {
        logger.info("bayes transform", document);
        return document;
    }

    /**
     * Train classifier classifier or create a new one and return it trained
     * @param {stream.Readable} trainingStream
     * @param {stream.Readable} classifier
     * @returns {Promise.classifier}
     */
    train(trainingStream, maxIterations, minImprovement, classifier) {
        const self = this;
        return new Promise((resolve, reject) => {
            const toTrainClassifier = classifier ? classifier : new NaturalBayesClassifier(),
                writable = new Writable({
                    "objectMode": true,
                    "write": (chunk, encoding, callback) => {
                        const transformedDocument = self.transformDocument(
                            chunk.document);
                        logger.info("bayes train", {
                            "class": chunk.class,
                            document: transformedDocument
                        });
                        toTrainClassifier.addDocument(
                            transformedDocument, chunk.class
                        );
                        callback();
                    }
                });
            writable.on("error", (error) => {
                reject(error);
            });
            writable.on("finish", () => {
                toTrainClassifier
                    .train(
                        maxIterations ? maxIterations :
                        undefined,
                        minImprovement ? minImprovement /
                        100 : undefined
                    );
                resolve(toTrainClassifier);
            });
            trainingStream.pipe(writable);
        });
    }
    /**
     * Get classifier score comparing to trainingStream 
     * @param {stream.Readable} trainingStream
     * @param {object} classifier
     * @returns {object}
     */
    score(trainingStream, classifier) {
        const self = this;
        return new Promise((resolve, reject) => {
            let success = 0,
                failures = 0;
            const writable = new Writable({
                "objectMode": true,
                "write": (chunk, encoding, callback) => {
                    self
                        .classify(
                            chunk.document,
                            classifier
                        )
                        .then(classResult => {
                            if (classResult ===
                                chunk.class) {
                                success++;
                            } else {
                                failures++;
                            }
                            logger.info(
                                "bayes score compare", {
                                    chunk: chunk,
                                    "success": success,
                                    "failures": failures
                                });
                            callback();
                            return classResult;
                        })
                        .catch(error => {
                            callback(error);
                        });
                }
            });
            writable.on("error", (error) => {
                reject(error);
            });
            writable.on("finish", () => {
                const stats = {
                    "success": success,
                    "failures": failures,
                    "success rate": success / (success +
                        failures)
                };
                logger.info("bayes score statistics", stats);
                resolve(stats);
            });
            trainingStream.pipe(writable);
        });
    }
    /**
     * Save classifier data to file for futher use
     * @param {string} file File name
     * @param {object} classifier classifier data to save
     * @returns {Promise.{object}}
     */
    save(file, classifier) {
        return new Promise((resolve, reject) => {
            classifier.save(file, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve(classifier);
            });
        });
    }
}


module.exports = BayesClassifier;

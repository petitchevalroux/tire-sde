"use strict";
const Writable = require("stream")
        .Writable,
    Promise = require("bluebird"),
    path = require("path"),
    logger = require(path.join(__dirname, "..", "logger"));
class RootClassifier {

    /**
     * Classify a document
     * @param {String} document
     * @param {Classifier} classifier
     * @returns {Promise<String>} resulting class
     */
    classify() {
        return Promise.reject(new Error("classify not implemented"));
    }

    /**
     * Save classifier data to file for futher use
     * @param {String} file File name
     * @param {Object} classifier classifier data to save
     * @returns {Promise<object>}
     */
    save() {
        return Promise.reject(new Error("save not implemented"));
    }


    /**
     * Load classifier data from file file and return classifer
     * @param {String} file
     * @returns {Promise<Classifier>}
     */
    load() {
        return Promise.reject(new Error("load not implemented"));
    }

    /**
     * Transform document
     * @param {String|Array} document
     * @returns {Promise<String|Array>}
     */
    transformDocument(document) {
        return Promise.resolve(document);
    }

    /**
     * Transform class
     * @param {String|Array} document
     * @returns {Promise<String|Array>}
     */
    transformClass(label) {
        return Promise.resolve(label);
    }

    /**
     * Create a new classifier
     * @returns {Promise<Classifier>}
     */
    createClassifier() {
        return Promise.reject(new Error("createClassifier not implemented"));
    }

    /**
     * Learn classifier from document as label
     * @param {String|Array} document after transformation
     * @param {String|Interger} label after transformation
     * @param {Classifier} classifier
     * @return  {Array} [document,label]
     */
    learn() {
        return Promise.reject(new Error("learn not implemented"));
    }

    /**
     * Finalyze training
     * @param {Array} documents all transformed documents
     * @param {Array} classes all transformed classes
     * @param {Classifier} classifier 
     * @return {Promise<Classifier>}
     */
    finalizeTraining() {
        return Promise.reject(new Error("finalizeTraining not implemented"));
    }


    /**
     * Train classifier create a new classifier and return it
     * @param {stream.Readable} trainingStream
     * @param {stream.Readable} classifier
     * @returns {Promise.classifier}
     */
    train(trainingStream, options) {
        const self = this;
        return self
            .createClassifier(options)
            .then(classifier => {
                if (!classifier) {
                    throw Error("empty classifier");
                }
                return new Promise((resolve, reject) => {
                    const documents = [],
                        labels = [],
                        writable = new Writable({
                            "objectMode": true,
                            "write": (chunk, encoding,
                                callback) => {
                                Promise
                                    .all([
                                        self.transformDocument(
                                            chunk.document,
                                            classifier
                                        ),
                                        self.transformClass(
                                            chunk.class,
                                            classifier
                                        )
                                    ])
                                    .then(([document,
                                        label
                                    ]) => self.learn(
                                        document,
                                        label,
                                        classifier))
                                    .then(([document,
                                        label
                                    ]) => {
                                        documents.push(
                                            document
                                        );
                                        labels.push(
                                            label
                                        );
                                        return callback();
                                    })
                                    .catch(error => {
                                        callback(
                                            error
                                        );
                                    });
                            }
                        });
                    writable.on("error", (error) => {
                        reject(error);
                    });
                    writable.on("finish", () => {
                        self
                            .finalizeTraining(documents,
                                labels, classifier)
                            .then(() => {
                                resolve(classifier);
                                return classifier;
                            })
                            .catch(error => {
                                reject(error);
                            });
                    });
                    trainingStream.pipe(writable);
                });
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
}

module.exports = RootClassifier;

"use strict";
const Writable = require("stream")
        .Writable,
    Classifier = require("ml-naivebayes")
        .GaussianNB,
    Promise = require("bluebird"),
    path = require("path"),
    logger = require(path.join(__dirname, "..", "logger")),
    streamToXy = require("@petitchevalroux/dataset-stream-to-xy"),
    {
        Transform
    } = require("stream"),
    Corpus = require("@petitchevalroux/corpus"),
    tokenize = require("@petitchevalroux/tokenizer-default"),
    Vectorizer = require("@petitchevalroux/vector-bow-one-hot"),
    ClassesMap = require("@petitchevalroux/dataset-classes-map");

class BayesOneHotClassifier {

    constructor() {
        this.corpus = new Corpus();
        this.tokenize = tokenize;
        const vectorizer = new Vectorizer(),
            self = this;
        this.vectorize = bow => {
            return vectorizer.getVector(bow, self.corpus);
        };
    }

    classify(document, classifier) {
        const classification = classifier.predict([this.transformDocument(
            document)]);
        logger.info("bayes one hot classify", {
            "class": classification,
            document: document
        });
        return classification[0];
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
        logger.info("bayes one not transform", document);
        return this.vectorize(this.tokenize(document));
    }

    /**
     * Train classifier classifier or create a new one and return it trained
     * @param {stream.Readable} trainingStream
     * @param {stream.Readable} classifier
     * @returns {Promise<classifier>}
     */
    train(trainingStream, maxIterations, minImprovement, classifier) {
        const self = this;
        return streamToXy(
            trainingStream.pipe(new Transform({
                objectMode: true,
                transform: (chunk, encoding, callback) => {
                    callback(null, [chunk.document, chunk.class]);
                }
            })))
            .then(([documents, classes]) => {
                // Transform documents to bag of words
                const bows = documents.map(document => self.tokenize(
                    document));
                return self.corpus.addBows(bows)
                    .then(() => [bows, classes]);
            })
            .then(([bows, classes]) => {
                // Transform bows to vectors
                return Promise
                    .all(bows.map(bow => self.vectorize(bow)))
                    .then(vectors => [vectors, classes]);
            })
            .then(([vectors, classes]) => {
                const toTrainClassifier = classifier ? classifier : new Classifier(),
                    classesMap = new ClassesMap(classes);
                toTrainClassifier.train(vectors, classesMap.toIntegers());
                return toTrainClassifier;
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
                    const resultClass =
                        classifier.classify(
                            chunk.document);
                    if (self.classify(chunk.document,
                        classifier) ==
                        chunk.class) {
                        success++;
                    } else {
                        failures++;
                    }
                    logger.info(
                        "bayes score compare", {
                            "class": resultClass,
                            chunk: chunk,
                            "success": success,
                            "failures": failures
                        });
                    callback();
                }
            });
            writable.on("error", (error) => {
                reject(error);
            });
            writable.on("finish", () => {
                const stats = {
                    "success": success,
                    "failures": failures,
                    "success rate": success / (
                        success +
                        failures)
                };
                logger.info(
                    "bayes score statistics",
                    stats);
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


module.exports = BayesOneHotClassifier;

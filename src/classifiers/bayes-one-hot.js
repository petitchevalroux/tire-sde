"use strict";
const Classifier = require("ml-naivebayes")
        .MultinomialNB,
    Promise = require("bluebird"),
    path = require("path"),
    Corpus = require("@petitchevalroux/corpus"),
    tokenize = require("@petitchevalroux/tokenizer-default"),
    Vectorizer = require("@petitchevalroux/vector-bow-one-hot"),
    RootClassifier = require(path.join(__dirname, "root")),
    ClassesMap = require("@petitchevalroux/dataset-classes-map"),
    fs = require("fs");

class BayesOneHotClassifier extends RootClassifier {
    /**
     * Classify a document
     * @param {String} document
     * @param {Classifier} classifier
     * @returns {Promise<String>} resulting class
     */
    classify(document, classifier) {
        return this.transformDocument(document, classifier)
            .then(document => {
                const classification = classifier.predict([document]);
                try {
                    return classifier.classes.getClass(classification[0]);
                } catch (error) {
                    return "";
                }
            });
    }

    /**
     * Save classifier data to file for futher use
     * @param {String} file File name
     * @param {Object} classifier classifier data to save
     * @returns {Promise<object>}
     */
    save(file, classifier) {
        return new Promise((resolve, reject) => {
            const stream = fs.createWriteStream(file);
            stream.end(JSON.stringify({
                classifier: classifier.toJSON(),
                classes: JSON.parse(classifier.classes.toJSON())
            }), error => {
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
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
    transformDocument(document, classifier) {
        return new Promise(resolve => {
            resolve(classifier.vectorize(classifier.tokenize(
                document), classifier.corpus));
        });
    }

    /**
     * Create a new classifier
     * @returns {Promise<Classifier>}
     */
    createClassifier() {
        const classifier = new Classifier(),
            vectorizer = new Vectorizer();
        classifier.corpus = new Corpus();
        classifier.vectorize = (bow, corpus) => {
            return vectorizer.getVector(bow, corpus);
        };
        classifier.tokenize = (document) => {
            return tokenize(document);
        };
        classifier.classes = new ClassesMap();
        return Promise.resolve(classifier);
    }

    /**
     * Learn classifier from document as label
     * @param {String|Array} document after transformation
     * @param {String|Interger} label after transformation
     * @param {Classifier} classifier
     * @return  {Array} [document,label]
     */
    learn(document, label, classifier) {
        return new Promise(resolve => {
            resolve([classifier.tokenize(document),
                classifier.classes
                    .add(label)
            ]);
        });
    }

    /**
     * Finalyze training
     * @param {Array} documents all transformed documents
     * @param {Array} classes all transformed classes
     * @param {Classifier} classifier 
     * @return {Promise<Classifier>}
     */
    finalizeTraining(documents, labels, classifier) {
        return classifier.corpus.addBows(documents)
            .then(corpus => {
                return Promise
                    .all(documents.map(document => classifier
                        .vectorize(document, corpus)))
                    .then(vectors => {
                        classifier.train(vectors, labels);
                        return classifier;
                    });
            });
    }

}


module.exports = BayesOneHotClassifier;

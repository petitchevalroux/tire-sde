"use strict";

const NaturalBayesClassifier = require("natural")
        .BayesClassifier,
    Promise = require("bluebird"),
    path = require("path"),
    RootClassifier = require(path.join(__dirname, "root"));
class BayesClassifier extends RootClassifier {

    /**
     * Classify a document
     * @param {String} document
     * @param {Classifier} classifier
     * @returns {Promise<String>} resulting class
     */
    classify(document, classifier) {
        return this.transformDocument(document)
            .then(document => {
                return classifier.classify(document);
            });
    }

    /**
     * Save classifier data to file for futher use
     * @param {String} file File name
     * @param {Classifier} classifier classifier data to save
     * @returns {Promise<Classifier>}
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

    /**
     * Load classifier data from file file and return classifer
     * @param {String} file
     * @returns {Promise<Classifier>}
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
     * Create a new classifier
     * @returns {Promise<Classifier>}
     */
    createClassifier() {
        return Promise.resolve(new NaturalBayesClassifier());
    }

    /**
     * Learn classifier from document as label
     * @param {String|Array} document after transformation
     * @param {String|Interger} label after transformation
     * @param {Classifier} classifier
     * @return  {Array} [document,label]
     */
    learn(document, label, classifier) {
        return new Promise((resolve) => {
            classifier.addDocument(document, label);
            resolve([document, label]);
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
        return new Promise(resolve => {
            classifier.train();
            resolve(classifier);
        });
    }
}

module.exports = BayesClassifier;

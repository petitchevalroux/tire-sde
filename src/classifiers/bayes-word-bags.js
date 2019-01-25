"use strict";
const
    path = require("path"),
    BayesClassifier = require(path.join(__dirname, "bayes")),
    StringTransform = require(path.join(__dirname, "..", "libraries",
        "string-transform")),
    stringTransform = new StringTransform(),
    logger = require(path.join(__dirname, "..", "logger")),
    Promise = require("bluebird");

class BayesWordBagsClassifier extends BayesClassifier {

    /**
     * Transform document
     * @param {String|Array} document
     * @returns {Promise<String|Array>}
     */
    transformDocument(document) {
        return new Promise(resolve => {
            const transformed = stringTransform.toLowerCase(
                stringTransform.keepAlphaNum(
                    stringTransform.unaccent(
                        document)))
                .split(" ");
            logger.info("bayes word bags transform", {
                "transformed": transformed,
                "document": document
            });
            resolve(transformed);
        });
    }

}


module.exports = BayesWordBagsClassifier;

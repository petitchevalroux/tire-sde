"use strict";
const
    path = require("path"),
    BayesClassifier = require(path.join(__dirname, "bayes")),
    StringTransform = require(path.join(__dirname, "..", "libraries",
        "string-transform")),
    stringTransform = new StringTransform(),
    logger = require(path.join(__dirname, "..", "logger"));


class BayesWordBagsClassifier extends BayesClassifier {

    /**
     * Transform document
     * @param {string|array} document
     * @returns {string|array}
     */
    transformDocument(document) {
        const transformed = stringTransform.toLowerCase(
            stringTransform.keepAlphaNum(
                stringTransform.unaccent(
                    document)))
            .split(" ");
        logger.info("bayes word bags transform", {
            "transformed": transformed,
            "document": document
        });
        return document;
    }

}


module.exports = BayesWordBagsClassifier;

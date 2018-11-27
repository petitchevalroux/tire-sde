"use strict";
const removeAccents = require("remove-accents-diacritics"),
    XRegExp = require("xregexp"),
    regNonAlphaNum = XRegExp("[^\\p{L}\\p{Nd}]", "g"),
    regMultipleSpaces = XRegExp(" {2,}", "g");
class StringTransform {
    toLowerCase(string) {
        return string.toString()
            .toLowerCase();
    }

    unaccent(string) {
        return removeAccents.remove(string.toString());
    }

    keepAlphaNum(string) {
        return string.toString()
            .replace(regNonAlphaNum, " ")
            .replace(regMultipleSpaces, " ")
            .trim();
    }
}

module.exports = StringTransform;

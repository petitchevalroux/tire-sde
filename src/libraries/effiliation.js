"use strict";
const fs = require("fs"),
    xmlNodes = require("xml-nodes"),
    xmlObjects = require("xml-objects");
class Effiliation {

    convertXmlToObject(xmlStream) {
        return xmlStream
            .pipe(xmlNodes("product"))
            .pipe(xmlObjects({
                explicitRoot: false,
                explicitArray: false,
                mergeAttrs: true
            }));
    }

    getStreamFromFile(file) {
        return this.convertXmlToObject(fs.createReadStream(file));
    }
}

module.exports = Effiliation;

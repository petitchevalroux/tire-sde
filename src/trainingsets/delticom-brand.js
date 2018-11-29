"use strict";

const path = require("path"),
    StringTransform = require(path.join(__dirname, "..", "libraries",
        "string-transform")),
    stringTransform = new StringTransform(),
    Delticom = require(path.join(__dirname, "..", "libraries", "delticom")),
    Transform = require("stream")
        .Transform,
    logger = require(path.join(__dirname, "..", "logger"));

class DelticomBrandTrainingSet {

    constructor() {
        this.delticom = new Delticom();
    }

    getStream() {
        return this.delticom.getStreamFromFile(
            path.join(__dirname, "..", "..", "data",
                "delticom-feed.csv")
        )
            .pipe(new Transform({
                writableObjectMode: true,
                readableObjectMode: true,
                transform: (chunk, encoding, callback) => {
                    const values = Object.keys(chunk)
                        .map(k => chunk[k]);
                    if (values.length !== 21) {
                        callback();
                        return;
                    }
                    const output = {
                        "class": values[3] ?
                            stringTransform.keepAlphaNum(
                                stringTransform.toLowerCase(
                                    stringTransform.unaccent(
                                        values[3]))) : "",
                        "document": values[2] ? values[2] :
                            ""
                    };
                    if (!output.class || !output.document) {
                        callback();
                        return;
                    }
                    logger.info("trainingset brand transform",
                        output);
                    callback(null, output);
                }
            }));
    }
}
module.exports = DelticomBrandTrainingSet;

"use strict";

const path = require("path"),
    StringTransform = require(path.join(__dirname, "..", "libraries",
        "string-transform")),
    stringTransform = new StringTransform(),
    Effiliation = require(path.join(__dirname, "..", "libraries", "effiliation")),
    Transform = require("stream")
        .Transform,
    logger = require(path.join(__dirname, "..", "logger"));

class BrandTrainingSet {

    constructor() {
        this.effiliation = new Effiliation();
    }

    getStream() {
        return this.effiliation.getStreamFromFile(
            path.join(__dirname, "..", "..", "data",
                "effiliation-feed.xml")
        )
            .pipe(new Transform({
                writableObjectMode: true,
                readableObjectMode: true,
                transform: (chunk, encoding, callback) => {
                    const output = {
                        "class": chunk && chunk.brand ?
                            stringTransform.toLowerCase(
                                stringTransform.unaccent(
                                    chunk.brand)) : "",
                        "document": chunk && chunk.extras &&
                            chunk.extras.nom ? chunk.extras
                                .nom : ""
                    };
                    logger.info("trainingset brand transform",
                        output);
                    callback(null, output);
                }
            }));
    }
}
module.exports = BrandTrainingSet;

"use strict";

const path = require("path"),
    StringTransform = require(path.join(__dirname, "..", "libraries",
        "string-transform")),
    stringTransform = new StringTransform(),
    Effiliation = require(path.join(__dirname, "..", "libraries", "effiliation")),
    Transform = require("stream")
        .Transform,
    Writable = require("stream")
        .Transform,
    Promise = require("bluebird");

class BrandTrainingSet {

    constructor() {
        this.effiliation = new Effiliation();
    }

    getClasses() {
        const self = this;
        return new Promise((resolve, reject) => {
            try {
                const classes = new Set(),
                    writable = new Writable({
                        "objectMode": true,
                        "write": (chunk, encoding, callback) => {
                            classes.add(chunk.class);
                            callback();
                        }
                    });
                writable.on("error", (error) => {
                    reject(error);
                });
                writable.on("finish", () => {
                    resolve(Array.from(classes)
                        .sort());
                });
                self.getStream()
                    .pipe(writable);
            } catch (error) {
                return reject(error);
            }
        });
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
                    callback(null, {
                        "document": chunk && chunk.extras &&
                            chunk.extras.nom ? chunk.extras
                                .nom : "",
                        "class": chunk && chunk.brand ?
                            stringTransform.toLowerCase(
                                stringTransform.unaccent(
                                    chunk.brand)) : ""
                    });
                }
            }));
    }
}
module.exports = BrandTrainingSet;

"use strict";
const fs = require("fs"),
    csv = require("csv-streamify");
class convertCsvToObject {

    convertCsvToObject(csvStream) {
        return csvStream.pipe(csv({
            delimiter: "\t",
            columns: true
        }));
    }

    getStreamFromFile(file) {
        return this.convertCsvToObject(fs.createReadStream(file, {
            encoding: "latin1"
        }));
    }
}

module.exports = convertCsvToObject;

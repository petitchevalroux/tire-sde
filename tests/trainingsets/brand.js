"use strict";
const path = require("path"),
    assert = require("assert"),
    BrandTrainingSet = require(path.join(__dirname, "..", "..", "src",
        "trainingsets", "brand")),
    brandTrainingSet = new BrandTrainingSet(),
    Promise = require("bluebird"),
    PassThrough = require("stream")
        .PassThrough,
    sinon = require("sinon");

describe("brand training set", () => {

    const testStream = new PassThrough({
        writableObjectMode: true,
        readableObjectMode: true
    });
    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
        sandbox.stub(brandTrainingSet.effiliation,
            "getStreamFromFile");
        brandTrainingSet.effiliation.getStreamFromFile.callsFake(
            () => {
                return testStream;
            });
    });

    afterEach(() => {
        sandbox.restore();
    });
    describe("getStream", () => {
        const getData = () => {
            return new Promise((resolve, reject) => {
                const readable = brandTrainingSet.getStream();
                readable.on("error", (error) => {
                    reject(error);
                });
                readable.on("data", (data) => {
                    readable.end();
                    resolve(data);
                });
            });
        };

        it("return brand as lower case string", () => {
            testStream.write({
                brand: "MICHELIN"
            });
            return getData()
                .then(data => {
                    assert.equal(data.class,
                        "michelin");
                    return data;
                });
        });

        it("return remove accent from brand", () => {
            testStream.write({
                brand: "MiCHéLIà"
            });
            return getData()
                .then(data => {
                    assert.equal(data.class,
                        "michelia");
                    return data;
                });
        });

        it("return document without modifications", () => {
            testStream.write({
                extras: {
                    nom: "PNEU MICHéLIN PILOT SPORT 4 205/40R17 84 Y"
                }
            });
            return getData()
                .then(data => {
                    assert.equal(data.document,
                        "PNEU MICHéLIN PILOT SPORT 4 205/40R17 84 Y"
                    );
                    return data;
                });
        });
    });
});

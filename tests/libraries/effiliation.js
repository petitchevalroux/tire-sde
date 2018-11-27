"use strict";
const path = require("path"),
    assert = require("assert"),
    Effiliation = require(path.join(__dirname, "..", "..", "src", "libraries",
        "effiliation")),
    Promise = require("bluebird");
describe("effiliation", () => {
    const effiliation = new Effiliation();
    describe("getStreamFromFile", () => {

        const getData = () => {
            return new Promise((resolve, reject) => {
                const readable = effiliation
                    .getStreamFromFile(path.join(
                        __dirname, "..", "..",
                        "data",
                        "effiliation-feed.xml"));
                readable.on("error", (error) => {
                    reject(error);
                });
                readable.on("data", (data) => {
                    readable.destroy();
                    resolve(data);
                });
            });
        };

        // PNEU Nokian WEATHERPROOF 175/70R14 84T => Nokian
        it("return brand as string", () => {
            return getData()
                .then(data => {
                    assert.equal(typeof data.brand,
                        "string");
                    return data;
                });
        });

        // PNEU Nokian WEATHERPROOF 175/70R14 84T
        it("return extras.nom as string", () => {
            return getData()
                .then(data => {
                    assert.equal(typeof data.extras
                        .nom, "string");
                    return data;
                });
        });

        // PNEU Nokian WEATHERPROOF 175/70R14 84T => 175
        it("return size as string", () => {
            return getData()
                .then(data => {
                    assert.equal(typeof data.size,
                        "string");
                    return data;
                });
        });

        // PNEU Nokian WEATHERPROOF 175/70R14 84T => 70
        it("return extras.serie as string", () => {
            return getData()
                .then(data => {
                    assert.equal(typeof data.extras
                        .serie, "string");
                    return data;
                });
        });

        // PNEU Nokian WEATHERPROOF 175/70R14 84T => 84
        it("return extras.charge as string", () => {
            return getData()
                .then(data => {
                    assert.equal(typeof data.extras
                        .charge, "string");
                    return data;
                });
        });

        // PNEU Nokian WEATHERPROOF 175/70R14 84T => T
        it("return extras.vitesse as string", () => {
            return getData()
                .then(data => {
                    assert.equal(typeof data.extras
                        .vitesse, "string");
                    return data;
                });
        });
    });

});

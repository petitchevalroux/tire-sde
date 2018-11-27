"use strict";
const path = require("path"),
    assert = require("assert"),
    StringTransform = require(path.join(__dirname, "..", "..", "src",
        "libraries", "string-transform"));
describe("string-transform", () => {
    const stringTransform = new StringTransform();
    describe("toLowerCase", () => {
        it("convert string to lower case", () => {
            assert.equal(stringTransform.toLowerCase(
                "FoofLa"), "foofla");
        });
    });

    describe("unaccent", () => {
        it("remove accent", () => {
            assert.equal(stringTransform.unaccent(
                "cafetière"), "cafetiere");
        });
    });

    describe("keepAlphaNum", () => {
        it("keep only alpha num", () => {
            assert.equal(stringTransform.keepAlphaNum(
                "   this is 901--- 53"),
            "this is 901 53");
        });
    });
});

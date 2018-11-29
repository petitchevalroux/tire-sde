"use strict";
const path = require("path"),
    assert = require("assert"),
    command = new(require(path.join(__dirname, "..", "..", "src", "cli",
        "trainingset")))();
describe("cli/trainingset", () => {
    describe("getValidClasses", () => {

        it("filter classes with minFrequency", () => {
            assert.deepEqual(command.getValidClasses([
                [
                    "michelin",
                    7
                ],
                [
                    "pirelli",
                    2
                ],
                [
                    "continental",
                    4
                ]
            ], 4), ["michelin", "continental"]);
        });

    });

});

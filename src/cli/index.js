#!/usr/bin/env node

"use strict";
const path = require("path");
require('yargs') // eslint-disable-line
    .command(
        "train [classifier] [training]", "train a classifier",
        (yargs) => {
            yargs
                .positional("classifier", {
                    describe: "classifier to train"
                })
                .positional("training", {
                    describe: "training set to train with"
                })
                .option("verbose", {
                    alias: "v",
                    default: false
                });

        },
        (argv) => {
            require(path.join(__dirname, "train"))(argv);
        })
    .argv;

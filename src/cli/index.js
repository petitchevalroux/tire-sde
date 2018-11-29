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
                    describe: "training set to train with file or trainingset name"
                })
                .option("verbose", {
                    alias: "v",
                    default: false
                });
        },
        (argv) => {
            const command = new(require(path.join(__dirname, "train")))();
            command.run(argv);
        })
    .command(
        "trainingset [training]", "output training set to stdout",
        (yargs) => {
            yargs
                .positional("training", {
                    describe: "training set name"
                })
                .option("stats", {
                    default: false,
                    describe: "display training set statitics"
                })
                .option("filterClassMinFrequency", {
                    default: false,
                    number: true,
                    describe: "filter classes with less frequency"
                })
                .option("maxDocumentsPerClass", {
                    default: false,
                    number: true,
                    describe: "limite up to maxDocumentsPerClass documents per class"
                })
                .option("verbose", {
                    alias: "v",
                    default: false
                });
        },
        (argv) => {
            const command = new(require(path.join(__dirname, "trainingset")))();
            command.run(argv);
        })
    .argv;

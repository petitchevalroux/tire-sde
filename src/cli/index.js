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
                .option("load", {
                    default: false,
                    string: true,
                    describe: "model file to load"
                })
                .option("save", {
                    default: false,
                    string: true,
                    describe: "model file to save"
                })
                .option("minImprovement", {
                    default: 0,
                    number: true,
                    describe: "minimum improvement between iteration in percent (1 => 1%)"
                })
                .option("maxIterations", {
                    default: 0,
                    number: true,
                    describe: "maximum training iterations"
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
    .command(
        "corpus", "corpus",
        (yargs) => {
            yargs
                .positional("print-documents", {
                    describe: "output all documents"
                });
        },
        (argv) => {
            const command = new(require(path.join(__dirname, "corpus")))();
            command.run(argv);
        })
    .argv;

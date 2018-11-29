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

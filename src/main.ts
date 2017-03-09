#!/usr/bin/env node
declare function require(name:string);
import { readFileSync } from "fs";
import { writeFileSync } from 'jsonfile';
const walkSync = require('walk-sync');

import transform from './lib/json-api-transform';
import { err, log } from './lib/logging';

if (process.argv.length < 3) {
    throw new Error('You must provide a path to the config');
}

import { Application } from 'typedoc';
import { Config } from './lib/cli-interfaces';

main(process.argv[2], process.argv[3]);

function main(inputPath, outputPath) {
    const configFile = readFileSync(inputPath, 'utf8');
    const config = <Config>JSON.parse(configFile);

    const app = new Application({
        mode:   'File',
        logger: 'console',
        target: 'ES5',
        module: 'CommonJS',
    });

    const projects = config.projects.map((project) => {
        let files = walkSync(project.src, { directories: false }).map((path) => project.src + path);
        return app.convert(files);
    });

    const transformed = transform(config.manifest, projects);
    const out = config.output || outputPath;
    writeFileSync(out, transformed, { spaces: 2 });
    console.log('Output file saved to: ' + out);
}
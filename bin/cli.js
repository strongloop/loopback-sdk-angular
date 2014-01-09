#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var generator = require('..');

if (process.argv.length < 3) {
  console.error('Usage:');
  console.error('    bin/cli.js server/app.js [client/js/lb-services.js]');
  console.error('The first argument is path to LoopBack app file.');
  console.error('The second argument is path where to save the generated file');
  return;
}

var appFile = path.resolve(process.argv[2]);
console.error('Loading LoopBack app %j', appFile);
var app = require(appFile);

var result = generator(app);

var outputFile = process.argv[3];
if (outputFile) {
  outputFile = path.resolve(outputFile);
  console.error('Saving the generated script to %j', outputFile);
  fs.writeFileSync(outputFile, result.script);
} else {
  console.error('Dumping to stdout');
  process.stdout.write(result.script);
}

process.exit();

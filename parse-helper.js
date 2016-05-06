// Copyright IBM Corp. 2014. All Rights Reserved.
// Node module: loopback-sdk-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*!
 * Parsers for extracting data from the generated lb-service.js code.
 * Used by unit-tests in grunt-loopback-sdk-angular and
 * loopback-sdk-angular-cli.
 */

var expect = require('chai').expect;

function parse(script, regex) {
  expect(script).to.match(regex);
  return regex.exec(script)[1] || '';
}

exports.moduleName = function(script) {
  return parse(script, /.*angular\.module\("([^"]*)",.*/);
};

exports.baseUrl = function(script) {
  return parse(script, /var urlBase = "([^"]*)";/);
};

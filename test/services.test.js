// Copyright IBM Corp. 2016,2018. All Rights Reserved.
// Node module: loopback-sdk-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var expect = require('chai').expect;
var generateServices = require('..').services;
var loopback = require('loopback');

describe('services generator', function() {
  it('rejects namespaceCommonModels:true with default namespaceDelimiter',
  function() {
    var app = loopback();
    var options = {
      namespaceCommonModels: true,
    };

    expect(function() { generateServices(app, options); })
      .to.throw(/unsupported delimiter/i);
  });

  it('accepts a valid namespace delimiter', function() {
    var app = loopback();
    var options = {
      namespaceCommonModels: true,
      namespaceModels: true,
      namespaceDelimiter: '_',
    };
    var result = generateServices(app, options);

    expect(result).to.be.a('string');
  });
});

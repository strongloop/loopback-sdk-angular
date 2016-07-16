// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-sdk-angular
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

define(function() {
  'use strict';

  var util = {};

  util.throwHttpError = function(res) {
    if (res instanceof Error) throw res;
    if (!(res.status && res.headers)) throw res;

    var msg = 'HTTP ' + res.status;
    if (res.data && res.data.error && res.data.error.message)
      msg += ' ' + res.data.error.message;
    msg += ' [' + res.config.method + ' ' + res.config.url + ']';

    var details = res.data && res.data.error && res.data.error.details;
    if (details)
      msg += '\nDetails: ' + JSON.stringify(details, null, 2);

    throw new Error(msg);
  };

  return util;
});

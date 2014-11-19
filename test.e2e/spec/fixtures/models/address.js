// Dependencies
// Note:
//  * The below values are relevant for server-side
//  * For client-side, dependencies must be declared in model-config.json file
//  * And they have to be available as an Angular provider in your app
var _ = require('lodash');
// Description: Extend `Address` model in Angular client generated service
//              with static and prototype methods/properties
//
// Notes:
//  * Docular comments will be included in Service doc as long as
//    they moduleName and modelName are correct
//  * Model must be declared in client-model.json to be generated/extended
module.exports = function (Address) {

  /**
  * @ngdoc property
  * @name lbServices.Address#contryCodes
  * @propertyOf lbServices.Address
  *
  * @description
  *
  * Transform ISO contry code to readable string
  *
  */
  Address.countryCodes = {
    'us': 'United States',
    'fr': 'France'
  };

  /**
   * @ngdoc method
   * @name lbServices.Address#getFullAddress
   * @methodOf lbServices.Address
   *
   * @description
   *
   * Instance method returning complete address
   *
   * @return {String} Complete address
   */
  Address.prototype.getFullAddress = function () {
    // Just to test dependency on lodash :
    _.noop();
    return this.recipient + ' ' + Address.countryCodes[this.country];
  };

  return Address;
};

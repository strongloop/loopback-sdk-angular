// Dependencies
// Note:
//  * The below values are relevant for server-side
//  * For client-side, dependencies must be declared in model-config.json file
//  * And they have to be available as an Angular provider in your app
var _ = require('lodash');
// Description: Extend `MyModel` model in Angular client generated service
//              with static and prototype methods/properties
//
// Notes:
//  * Docular comments will be included in Service doc as long as
//    they moduleName and modelName are correct
//  * Model must be declared in client-model.json to be generated/extended
module.exports = function (MyModel) {

  /**
  * @ngdoc property
  * @name lbServices.MyModel#STATUS
  * @propertyOf lbServices.MyModel
  *
  * @description
  *
  * Status value constant
  *
  */
  MyModel.STATUS = 1;

  /**
   * @ngdoc method
   * @name lbServices.MyModel#findTwo
   * @methodOf lbServices.MyModel
   *
   * @description
   *
   * Find two instances of the model from the data source
   *
   * @param {Function(Array.<Object>, Object)=} successCb
   *   Success callback with two arguments: `value`, `responseHeaders`.
   *
   * @param {Function(Object)=} errorCb Error callback with one argument:
   *   `httpResponse`.
   *
   * @return {Array.<Object>} An empty reference that will be
   *   populated with the actual data once the response is returned
   *   from the server.
   */
  MyModel.findTwo = function (successCb, errorCb) {
    // Just to test dependency on lodash :
    _.noop();
    return MyModel.find({filter: {limit: 2}}, function(items, headers) {
      if (successCb)
        successCb(items, headers);
    }, errorCb);
  };

  /**
   * @ngdoc method
   * @name lbServices.MyModel#getTotal
   * @methodOf lbServices.MyModel
   *
   * @description
   *
   * Instance method computing total of `firstValue` and `secondValue`
   *
   * @return {Number} The total
   */
  MyModel.prototype.getTotal = function () {
    return this.first + this.second;
  };

  return MyModel;
};

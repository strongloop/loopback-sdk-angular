var services = require('./lib/services');

exports = module.exports = function angularResources(app) {
  return {
    services: services(app)
  };
};

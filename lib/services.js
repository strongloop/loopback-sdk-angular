var fs = require('fs');
var ejs = require('ejs');

ejs.filters.q = function(obj) {
  return JSON.stringify(obj, null, 2 );
};

exports = module.exports = function generateServices(app) {
  var models = describeModels(app);

  var servicesTemplate = fs.readFileSync(
    require.resolve('../templates/services.template'),
    { encoding: 'utf-8' }
  );

  return ejs.render(servicesTemplate, {
    models: models
  });
};

function describeModels(app) {
  var apiPath = app.get('apiPathRoot') || '/api';
  var remotes = app.remotes();
  var allClasses = remotes.classes();
  var allRoutes = remotes.handler('rest').adapter.allRoutes();

  var result = {};

  allRoutes.forEach(function(route) {
    var methodParts = route.method.split('.');
    var classPart = methodParts[0];
    var methodName = methodParts.slice(1).join('$');

    var classDef = allClasses.filter(function (item) {
      return item.name === classPart;
    })[0];


    var className = classDef && classDef.ctor.definition && classDef.ctor.definition.name;
    if (!className) {
      return; // not a LoopBack model
    }

    // Ensure the first letter is upper-case
    className = className[0].toUpperCase() + className.slice(1);

    var modelDesc = result[className];
    if (!modelDesc) {
      modelDesc = result[className] = {
        url: undefined,
        paramDefaults: undefined,
        actions: {}
      };
    }

    var fullPath = apiPath + route.path;


    if (methodName == 'findById') {
      // findById should be mounted at the base REST path, e.g. /users/:id
      modelDesc.url = fullPath;
      // TODO - defaults should come from `route.accepts` or even class data
      modelDesc.paramDefaults = { id: '@id' };
    }

    modelDesc.actions[methodName] = {
      url: apiPath + route.path,
      method: getMethodFromVerb(route.verb),
      // TODO(bajtos) convert route accepts to angular params (?)
      isArray: isReturningArray(route.returns),
      _accepts: route.accepts,
      _returns: route.returns,
      _description: route.description
    };
  });

  return result;
}

function getMethodFromVerb(verb) {
  if (verb === 'all') return 'POST';
  return verb.toUpperCase();
}

function isReturningArray(routeReturns) {
  return routeReturns && routeReturns.length == 1 &&
    routeReturns[0].root  &&
    routeReturns[0].type === 'array' ? true : undefined;
}

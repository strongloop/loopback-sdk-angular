var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

ejs.filters.q = function(obj) {
  return JSON.stringify(obj, null, 2 );
};

/**
 * Generate Angular $resource services for the given loopback application.
 *
 * ```js
 * var generateServices = require('loopback-sdk-angular').services;
 * var app = require('./server/server');
 *
 * var client = generateServices(app, 'lbServices', '/api');
 * require('fs').writeFileSync('client/loopback.js', client, 'utf-8');
 * ```
 *
 * @param {Object} app The loopback application created via `app = loopback()`.
 * @param {string=} ngModuleName A name for the generated Angular module.
 *   Default: `lbServices`.
 * @param {string=} apiUrl The URL where the client can access the LoopBack
 *   server app. Default: `/`.
 * @returns {string} The generated javascript code.
 * @header generateServices
 */
module.exports = function generateServices(app, ngModuleName,
                                           apiUrl, clientModelConfig) {
  ngModuleName = ngModuleName || 'lbServices';
  apiUrl = apiUrl || '/';

  var models = describeModels(app);

  if (!!clientModelConfig) applyClientModelConfig(models, clientModelConfig);

  var servicesTemplate = fs.readFileSync(
    require.resolve('./services.template.ejs'),
    { encoding: 'utf-8' }
  );

  return ejs.render(servicesTemplate, {
    moduleName: ngModuleName,
    models: models,
    urlBase: apiUrl.replace(/\/+$/, '')
  });
};

function describeModels(app) {
  var result = {};
  app.handler('rest').adapter.getClasses().forEach(function(c) {
    var name = c.name;

    if (!c.ctor) {
      // Skip classes that don't have a shared ctor
      // as they are not LoopBack models
      console.error('Skipping %j as it is not a LoopBack model', name);
      return;
    }

    // The URL of prototype methods include sharedCtor parameters like ":id"
    // Because all $resource methods are static (non-prototype) in ngResource,
    // the sharedCtor parameters should be added to the parameters
    // of prototype methods.
    c.methods.forEach(function fixArgsOfPrototypeMethods(method) {
      var ctor = method.restClass.ctor;
      if (!ctor || method.sharedMethod.isStatic) return;
      method.accepts = ctor.accepts.concat(method.accepts);
    });

    c.isUser = c.sharedClass.ctor.prototype instanceof app.loopback.User ||
      c.sharedClass.ctor.prototype === app.loopback.User.prototype;
    result[name] = c;
  });

  buildScopes(result);

  return result;
}

var SCOPE_METHOD_REGEX = /^prototype.__([^_]+)__(.+)$/;

function buildScopes(models) {
  for (var modelName in models) {
    buildScopesOfModel(models, modelName);
  }
}

function buildScopesOfModel(models, modelName) {
  var modelClass = models[modelName];

  modelClass.scopes = {};
  modelClass.methods.forEach(function(method) {
    buildScopeMethod(models, modelName, method);
  });

  return modelClass;
}

// reverse-engineer scope method
// defined by loopback-datasource-juggler/lib/scope.js
function buildScopeMethod(models, modelName, method) {
  var modelClass = models[modelName];
  var match = method.name.match(SCOPE_METHOD_REGEX);
  if (!match) return;

  var op = match[1];
  var scopeName = match[2];
  var modelPrototype = modelClass.sharedClass.ctor.prototype;
  var targetClass = modelPrototype[scopeName]._targetClass;

  if (modelClass.scopes[scopeName] === undefined) {
    if (!targetClass) {
      console.error(
        'Warning: scope %s.%s is missing _targetClass property.' +
        '\nThe Angular code for this scope won\'t be generated.' +
        '\nPlease upgrade to the latest version of' +
        '\nloopback-datasource-juggler to fix the problem.',
        modelName, scopeName);
      modelClass.scopes[scopeName] = null;
      return;
    }

    if (!findModelByName(models, targetClass)) {
      console.error(
        'Warning: scope %s.%s targets class %j, which is not exposed ' +
        '\nvia remoting. The Angular code for this scope won\'t be generated.',
        modelName, scopeName, targetClass);
      modelClass.scopes[scopeName] = null;
      return;
    }

    modelClass.scopes[scopeName] = {
      methods: {},
      targetClass: targetClass
    };
  } else if (modelClass.scopes[scopeName] === null) {
    // Skip the scope, the warning was already reported
    return;
  }

  var apiName = scopeName;
  if (op == 'get') {
    // no-op, create the scope accessor
  } else if (op == 'delete') {
    apiName += '.destroyAll';
  } else {
    apiName += '.' + op;
  }

  // Names of resources/models in Angular start with a capital letter
  var ngModelName = modelName[0].toUpperCase() + modelName.slice(1);
  method.internal = 'Use ' + ngModelName + '.' + apiName + '() instead.';

  // build a reverse record to be used in ngResource
  // Product.__find__categories -> Category.::find::product::categories
  var reverseName = '::' + op + '::' + modelName + '::' + scopeName;

  var reverseMethod = Object.create(method);
  reverseMethod.name = reverseName;
  reverseMethod.internal = 'Use ' + ngModelName + '.' + apiName + '() instead.';
  // override possibly inherited values
  reverseMethod.deprecated = false;

  var reverseModel = findModelByName(models, targetClass);
  reverseModel.methods.push(reverseMethod);

  var scopeMethod = Object.create(method);
  scopeMethod.name = reverseName;
  // override possibly inherited values
  scopeMethod.deprecated = false;
  scopeMethod.internal = false;
  modelClass.scopes[scopeName].methods[apiName] = scopeMethod;
}

function findModelByName(models, name) {
  for (var n in models) {
    if (n.toLowerCase() == name.toLowerCase())
      return models[n];
  }
}

// Apply client model config, usually from client/model-config.json
function applyClientModelConfig(models, clientModelConfig) {
  var modelConfig;

  try {
    // Do not use require() below : require caches value, and if it is modified
    // next call will use this modified data. Unless object is deep cloned,
    // which is an alternative as reading file each time.
    var configFile = fs.readFileSync(clientModelConfig, {encoding: 'utf-8'});
    modelConfig = JSON.parse(configFile);
  } catch(err) {
    console.trace('FATAL: Provided client config file could not be loaded : ' +
                  clientModelConfig, err);
    process.exit(1);
  }

  // Default location in loopback workspace, relative to /client/model-config.js
  var sources = [
    '../common/models',
    './models'
  ];
  if (!!modelConfig._meta && Array.isArray(modelConfig._meta.sources)) {
    sources = modelConfig._meta.sources;
    delete modelConfig._meta;
  }
  sources = sources.map(function(source) {
    return path.join(path.dirname(clientModelConfig), source);
  });

  var n;
  // Discard models not present in config
  for (n in models) {
    if (!(n in modelConfig)) {
      console.log('Info: Model ' + n + ' was not defined in client config, ' +
                  'it will not be included in generated services file');
      delete models[n];
    }
  }

  for (n in modelConfig) {
    if (n in models) {
      models[n].isRemote = true;
    } else {
      if (modelConfig[n].dataSource == 'remote') {
        console.log('Warning: Model ' + n + ' is expected to be REST exposed ' +
          ' but is not found in app, so it will not be included ' +
          ' in generated services file');
        delete modelConfig[n];
        continue;
      } else {
        models[n] = {isRemote: false};
      }
    }

    var meta = models[n];
    meta.extensions = [];
    meta.dependencies = modelConfig[n].dependencies || [];
    // Supported file syntax for model ModelName : model-name.js
    var fsModelName = n.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

    // Add this model extension functions to models description
    // in `extensions` array property
    for (var s in sources) {
      var file = path.join(sources[s], fsModelName + '.js');
      if (fs.existsSync(file))
        meta.extensions.push(require(file));
    }
  }
}

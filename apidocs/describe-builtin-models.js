var fs = require('fs');
var path = require('path');
var loopback = require('loopback');
var generator = require('..');

var app = loopback();

app.dataSource('db', { connector: 'memory', defaultForType: 'db' });
app.dataSource('mail', { connector: 'mail', defaultForType: 'mail' });

app.model('User', {
  options: {
    base: 'User',
    relations: {
      accessTokens: {
        model: 'AccessToken',
        type: 'hasMany',
        foreignKey: 'userId'
      }
    }
  },
  dataSource: 'db'
});

loopback.autoAttach();

for (var key in loopback) {
  model = loopback[key];
  if (model.prototype instanceof loopback.Model && key != 'User') {
    app.model(model);
    console.log('added model %s', key);
  }
}

var script = generator.services(app, 'lbServices', '/api');
fs.writeFileSync(path.resolve(__dirname, 'lb-services.js'), script);

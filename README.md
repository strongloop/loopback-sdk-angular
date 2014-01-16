# loopback-angular

## Status

The spike is fully functional and can be used in any demo applications we
are developing now. It's probably ok to commit the generated file into
public github repos, even though we are keeping the generator private for now.

Note that the functionality of the generated resources did not get enough
testing, expect bugs.

## Installation

1. Clone this repository and checkout the correct branch

  ```sh
  $ git clone git@github.com:strongloop/loopback-angular.git
  $ cd loopback-angular
  $ git checkout feature/initial-spike
  ```

2. Link the module to global node_modules

  ```sh
  loopback-angular$ npm link
  ```

## Generating services.js

In your LoopBack+Angular project, run the following command to generate
a file with Angular services providing access to LoopBack Models:

```sh
$ lb-ng server/app.js client/js/lb-services.js
```

The first argument is the path to the LoopBack app file as generated by `slc`.

The second argument is the path where the generated code should be saved.

> Note: You have to re-run this command after every change in the model
> definitions.

## Angular API

Follow these steps to use the generated services inside your Angular
application:

1. Include "lb-services.js" in your index.html file

  ```html
  <script src="js/lb-services.js"></script>
  ```

2. Register the angular module `lbServices` as a dependency of your app.

  ```js
  angular.module('my-app-module',
    ['ngRoute' /* etc */, 'lbServices', 'my-app.controllers'])
  ```

3. To call a method on a model from your controller, add the model name
as a dependency of the controller.

  ```js
  // access User model
  module.controller('LoginCtrl', function($scope,  User, $location) {
    $scope.login = function() {
      $scope.loginResult = User.login($scope.credentials,
        function() {
          // success
        }, function(res) {
          // error
        });
  ```

  > Note: Angular model names start always with a capital letter,
  > even if your server definition starts with a lower-case letter.

## API Docs

The auto-generated source include ngdoc directives. You can use your favourite
ngdoc tool to view this documentation, e.g. [docular](http://grunt-docular.com/)

If you don't have Grunt workflow configured yet, you can use the following
command as a replacement for `grunt docular-server`:

```sh
$ lb-ng-doc client/js/lb-services.js
```

> Note: this tool provides only a very limited subset of docular features.
> It was created as a quick hack to check whether ngdoc+docular is a viable
> solution for providing API docs on the services generated by lb-ng.
>
> There are no ambitions to extend it into a full-fledged thing - you should
> switch to grunt-docular if you need a feature not implemented by lb-ng-doc.

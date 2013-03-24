'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.controllers', 'myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view', {templateUrl: 'partials/pdfView.html', controller: 'MyCtrl1'});
    $routeProvider.when('/permissions', {templateUrl: 'partials/permissions.html', controller: 'MyCtrl2'});
    $routeProvider.when('/select', {templateUrl: 'partials/selectFile.html', controller: 'MyCtrl3'});
    $routeProvider.when('/upload', {templateUrl: 'partials/uploadFile.html', controller: 'MyCtrl4'});
    $routeProvider.otherwise({redirectTo: '/select'});
  }]);

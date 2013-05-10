/*
 Copyright (C) 2013 Matthew Dawson (matthew@mjdsystems.ca)
 Copyright (C) 2013 Nathan Jervis (mirhagk@gmail.com)

 Eimbu is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 Eimbu is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
'use strict';

// Declare app level module which depends on filters, and services
angular.module('eimbu', ['eimbu.controllers', 'eimbu.filters', 'eimbu.services', 'eimbu.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view/:fileID', {templateUrl: 'partials/pdfView.html', controller: 'MyCtrl1'});
    $routeProvider.when('/permissions', {templateUrl: 'partials/permissions.html', controller: 'MyCtrl2'});
    $routeProvider.when('/select/:fileID', {templateUrl: 'partials/selectFile.html', controller: 'MyCtrl3'});
    $routeProvider.when('/select/', {templateUrl: 'partials/selectFile.html', controller: 'MyCtrl3'});
    $routeProvider.when('/upload', {templateUrl: 'partials/uploadFile.html', controller: 'MyCtrl4'});
    $routeProvider.otherwise({redirectTo: '/select'});
  }]);

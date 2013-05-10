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

/* jasmine specs for controllers go here */

describe('controllers', function () {
  beforeEach(module('eimbu.controllers'));
  
  describe('MyCtrl1', function() {
   it('should have the $scope.one set to 1', inject(function($rootScope, $controller) {
     var scope = $rootScope.$new(),
         ctrl  = $controller('MyCtrl1', {$scope: scope});
     expect(scope.one).toEqual(1);
   })) 
  });
  
  describe('MyCtrl2', function() {
   it('should have the $scope.two set to 2', inject(function($rootScope, $controller) {
     var scope = $rootScope.$new(),
         ctrl  = $controller('MyCtrl2', {$scope: scope});
     expect(scope.two).toEqual(2);
   })) 
  });
});

'use strict';

/* Services */

angular.module('myApp.services', ['ngResource'])
	.value('version', '0.1')
	.factory('Comment', function($resource){
		return $resource('api/comments.json', {}, {
			query: {method:'GET', params:{}, isArray:true}
		});})

	.factory('User', function($resource){
		return $resource('api/users.json', {}, {
			query: {method:'GET', params:{}, isArray:true}
		});})

	.factory('File', function($resource){
		return $resource('api/files.json', {}, {
			query: {method:'GET', params:{}, isArray:true}
		});})

	.factory('Permission', function($resource){
		return $resource('api/permissions.json', {}, {
			query: {method:'GET', params:{}, isArray:true}
		});
	}).

	factory('WebSocket$', function(){ if(WebSocket){  return WebSocket; } else { return null; } }).

	factory('WebSocketWrapper', function($rootScope, $q, WebSocket$) {
		return function(url, protocols) {
			var socket = new WebSocket$(url, protocols);
			var deferred = $q.defer();

			socket.onopen = function() {
				$rootScope.$apply(function() {
					socket.onerror = socket.onclose = socket.onopen = null;
					deferred.resolve(socket);
				});
			}
			socket.onclose = socket.onerror = function() {
				$rootScope.$apply(function() {
					socket.onerror = socket.onclose = socket.onopen = null;
					socket = null;
					deferred.reject('Failed to open socket!');
				});
			}

			return deferred.promise;
		};
	}).

	service('authentication', function($http) {
		this.verify_session = function() {
			return $http.get("api/ses/verify_session").then(function(res) {
				return res.data;
			});
		}
	})

	.constant('authenticationResolveVerifier', function($q, $window, authentication) {
		var q = $q.defer();

		authentication.verify_session().then(function(res) {
			if(res.hasToken === true) {
				q.resolve();
			} else {
				$window.location.replace(res.redirect_url);
				q.reject();
			}
		});

		return q.promise;
	});

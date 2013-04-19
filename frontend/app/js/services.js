'use strict';

/* Services */

angular.module('eimbu.services', ['ngResource'])
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

	factory('WebSocket$', function(){ if(window.WebSocket){  return WebSocket; } else { return null; } }).

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

	factory('ServerSocket', function(WebSocketWrapper, $rootScope, $q, $http) {
		var socket_p = $http.post('api/generate_cookie').then(function() {
			return WebSocketWrapper('ws://localhost:8080/ws').then(function(socket) {
				return socket;
			});
		});

		var messages_in_transit = {}
		var cur_msg_id = 0;

		socket_p.then(function(socket) {
			socket.onmessage = function(data) {
				var data = JSON.parse(data);
				var deferred = messages_in_transit[data.msg_id];
				if(deferred) {
					deferred.resolve(data.data);
				}
			};
		});

		return {
			send: function(op, op_path, data) {
				var deferred = $q.defer();
				socket_p.then(function(socket){
					var data_to_send = {
						'msg_id': cur_msg_id++,
						'op': op,
						'op_path': op_path,
						'data': data
					}
					messages_in_transit[data_to_send.msg_id] = deferred;
					socket.send(JSON.stringify(data_to_send));
				});
				return deferred.promise;
			}
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

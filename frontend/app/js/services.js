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
	})

	.service('authentication', function($http) {
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

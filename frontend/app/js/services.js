'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
	value('version', '0.1').
	service('authentication', function($http) {
		this.verify_session = function() {
			return $http.get("api/ses/verify_session").then(function(res) {
				return res.data;
			});
		}
	}).
	constant('authenticationResolveVerifier', function($q, $window, authentication) {
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

'use strict';

/* jasmine specs for services go here */

describe('service', function() {
	beforeEach(module('eimbu.services'));

	var $httpBackend;

	beforeEach(inject(function($injector) {
		$httpBackend = $injector.get('$httpBackend');
	}));

	describe('version', function() {
		it('should return current version', inject(function(version) {
			expect(version).toEqual('0.1');
		}));
	});

	describe('authentication', function() {
		var authServer;

		beforeEach(inject(function($injector) {
			authServer = {
				hasToken: false
			};

			// backend definition common for all tests
			$httpBackend.when('GET', 'api/ses/verify_session').respond(function() {
				if(authServer.hasToken == true) {
					return [200, {'hasToken': true}];
				} else {
					return [200, {'hasToken': false, 'redirect_url': 'the_url'}];
				}
			});
		}));

		it('verifies user initially not logged in gets url.', inject(function(authentication, $rootScope) {
			$httpBackend.expectGET('api/ses/verify_session');

			authentication.verify_session().then(function(result) {
				expect(result).toEqual({'hasToken': false, 'redirect_url': 'the_url'});
			});

			$httpBackend.flush();
			$rootScope.$digest();
		}));

		it('verifies user logged in is fine.', inject(function(authentication, $rootScope) {
			authServer.hasToken = true;
			$httpBackend.expectGET('api/ses/verify_session');

			authentication.verify_session().then(function(result) {
				expect(result).toEqual({'hasToken': true});
			});

			$httpBackend.flush();
			$rootScope.$digest();
		}));

	});

	describe('Authentication Resolver Verifier', function() {
		var authServer;
		var $window;
		var authenticationResolveVerifier;

		beforeEach(inject(function($injector) {
			authServer = {
				hasToken: false
			};

			// backend definition common for all tests
			$httpBackend.when('GET', 'api/ses/verify_session').respond(function() {
				if(authServer.hasToken == true) {
					return [200, {'hasToken': true}];
				} else {
					return [200, {'hasToken': false, 'redirect_url': 'http://login_url/'}];
				}
			});

			$window = {
				location: {
					href: "http://localhost",
					replace: function(url) {
						this.href = url
					}
				}
			};

			authenticationResolveVerifier = $injector.get('authenticationResolveVerifier');
		}));

		it('verifies redirection when user not logged in..', inject(function(authentication, $rootScope, $q) {
			$httpBackend.expectGET('api/ses/verify_session');

			authenticationResolveVerifier($q, $window, authentication).then(function() {
				this.fail(Error("Should not have a sucessful resolve!"));
			}.bind(this), function() {
				expect($window.location.href).toEqual('http://login_url/');
			});

			$httpBackend.flush();
			$rootScope.$digest();
		}));

		it('verifies user logged in is fine.', inject(function(authentication, $rootScope, $q) {
			authServer.hasToken = true;
			$httpBackend.expectGET('api/ses/verify_session');

			authenticationResolveVerifier($q, $window, authentication).then(function() {
			}, function() {
				this.fail(Error("Should have verified auth!"));
			}.bind(this));

			$httpBackend.flush();
			$rootScope.$digest();
		}));
	});
});

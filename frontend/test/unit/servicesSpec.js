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

/* jasmine specs for services go here */

describe('service', function() {
	beforeEach(module('eimbu.services'));

	describe('version', function() {
		it('should return current version', inject(function(version) {
			expect(version).toEqual('0.1');
		}));
	});

	describe('DOM Websocket Injector', function() {
		it('should return the DOM Websocket consturctor (if implemented in the browser)', function() {
			if(window.WebSocket) {
				inject(function(WebSocket$) {
					expect(WebSocket$).toEqual(WebSocket);
				});
			} else {
				inject(function(WebSocket$) {
					expect(WebSocket$).toEqual(null);
				});
			}
		});
	});

	describe('WebSocket Wrapper', function() {
		var WebSocket$ = null;
		var MySocket = null;

		beforeEach(function() {
			MySocket = {
				onopen: null,
				onclose: null,
				onerror: null,
				onmessage: null,

				ConnectSucceed: function() {
					if(this.onopen) {
						this.onopen();
					}
				},
				ConnectFailureNoError: function() {
					if(this.onclose) {
						this.onclose({ error: 0 });
					}
				},
				ConnectFailureWithError: function() {
					if(this.onerror) {
						this.onerror();
					}
					if(this.onclose) {
						this.onclose({ error: 1 });
					}
				}
			}
			WebSocket$ = function() {
				return MySocket;
			}
			module(function ($provide) {
				$provide.value('WebSocket$', WebSocket$);
			});
		});

		function verify_socket_handlers_are_null() {
			expect(MySocket.onopen).toEqual(null);
			expect(MySocket.onerror).toEqual(null);
			expect(MySocket.onclose).toEqual(null);
			expect(MySocket.onmessage).toEqual(null);
		}

		it('Test getting socket from sucessful connection.', inject(function($rootScope, WebSocketWrapper){
			var socket_p = WebSocketWrapper('ws://localhost');
			socket_p.then(function(socket) {
				expect(socket).toEqual(MySocket); //Test harness should make this true.  Make sure the assumption doesn't break later.  If false, verify_socket_handlers_are_null will not check what it should!

				verify_socket_handlers_are_null();
			}, function() {
				this.fail('Should have resolved the connection!');
			});
			MySocket.ConnectSucceed();
		}));
		it('Test failing connection, without calling on error.', inject(function($rootScope, WebSocketWrapper){
			var socket_p = WebSocketWrapper('ws://localhost');
			socket_p.then(function(socket) {
				this.fail('Connection should have failed!');
			}, function(error) {
				expect(error).toNotEqual(null);
				verify_socket_handlers_are_null();
			});
			MySocket.ConnectFailureNoError();
		}));
		it('Test failing connection, with calling on error.', inject(function($rootScope, WebSocketWrapper){
			var socket_p = WebSocketWrapper('ws://localhost');
			socket_p.then(function(socket) {
				this.fail('Connection should have failed!');
			}, function(error) {
				expect(error).toNotEqual(null);
				verify_socket_handlers_are_null();
			});
			MySocket.ConnectFailureWithError();
		}));
	});

	describe('ServerSocket', function() {
		var WebSocket$ = null;
		var MySocket = null;

		beforeEach(function() {
			WebSocket$ = function() {
				return MySocket;
			}
			module(function ($provide) {
				$provide.value('WebSocket$', WebSocket$);
			});
			inject(function($q, $httpBackend) {
				MySocket = {
					onopen: null,
					onclose: null,
					onerror: null,
					onmessage: null,

					_delay_response: false,

					send: function(data) {
						// Echo server.  Reflects data back regardless of data.  OP: ECHO PATH: ECHO_PATH
						var data_o = JSON.parse(data);
						expect(data_o.op).toEqual("ECHO");
						expect(data_o.op_path).toEqual("ECHO_PATH");

						var response = JSON.stringify({msg_id: data_o.msg_id, data: data_o.data});

						var sendResponse = function(onmessage){ return function() {
							if(onmessage) {
								onmessage(response);
							}
						}; }(this.onmessage);
						if(this._delay_response) {
							//This trick cause a delayed response.  Not using setTimeout to avoid having to actual give up control.
							var d = $q.defer();
							d.resolve();
							d.promise.then(sendResponse);
						} else {
							sendResponse();
						}
					},

					_connected: false,

					Connect: function() {
						this._connected = true;
						if(this.onopen) {
							this.onopen();
						}
					}
				}
				$httpBackend.when('POST', 'api/generate_cookie').respond(function() {
					return [200];
				});
				$httpBackend.expectPOST('api/generate_cookie');
			});
		});

		//Move test logic here, to avoid unncessary duplication.
		function preform_test($rootScope, $httpBackend, ServerSocket) {
			var my_data = {test: "YES", awesome: "always", scale: 1.0};
			var promise = ServerSocket.send("ECHO", "ECHO_PATH", my_data);
			var promise_resolved = false;

			promise.then(function(data) {
				expect(data).toEqual(my_data);
				promise_resolved = true;
			});

			$httpBackend.flush();
			$rootScope.$digest();
			MySocket.Connect();
			$rootScope.$digest();
			expect(promise_resolved).toEqual(true);
		}

		it('Test setup and send/receive message', function() {
			inject(preform_test);
		});

		it('Test setup and send/receive message (delay response)', function() {
			MySocket._delay_response = true;
			inject(preform_test);
		});
	});

	describe('authentication', function() {
		var authServer;

		beforeEach(inject(function($injector, $httpBackend) {
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

		it('verifies user initially not logged in gets url.', inject(function(authentication, $rootScope, $httpBackend) {
			$httpBackend.expectGET('api/ses/verify_session');

			authentication.verify_session().then(function(result) {
				expect(result).toEqual({'hasToken': false, 'redirect_url': 'the_url'});
			});

			$httpBackend.flush();
			$rootScope.$digest();
		}));

		it('verifies user logged in is fine.', inject(function(authentication, $rootScope, $httpBackend) {
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

		beforeEach(inject(function($injector, $httpBackend) {
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
		}));

		it('verifies redirection when user not logged in..', inject(function(authenticationResolveVerifier, authentication, $rootScope, $q, $httpBackend) {
			$httpBackend.expectGET('api/ses/verify_session');
			var verified = null;

			authenticationResolveVerifier($q, $window, authentication).then(function() {
				verified = true;
			}, function() {
				verified = false;
				expect($window.location.href).toEqual('http://login_url/');
			});

			$httpBackend.flush();
			$rootScope.$digest();

			expect(verified).toEqual(false);
		}));

		it('verifies user logged in is fine.', inject(function(authenticationResolveVerifier, authentication, $rootScope, $q, $httpBackend) {
			authServer.hasToken = true;
			$httpBackend.expectGET('api/ses/verify_session');
			var verified = null;

			authenticationResolveVerifier($q, $window, authentication).then(function() {
				verified = true;
			}, function() {
				verified = false;
			});

			$httpBackend.flush();
			$rootScope.$digest();

			expect(verified).toEqual(true);
		}));
	});
});

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
			if(WebSocket) {
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
			inject(function($q) {
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

						self = this;
						var sendResponse = function() {
							if(self.onmessage) {
								self.onmessage(response);
							}
						}
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
			});
		});

		it('Test setup and send/receive message', inject(function($rootScope, ServerSocket) {
			MySocket.Connect();
			var my_data = {test: "YES", awesome: "always", scale: 1.0};
			var promise = ServerSocket.send("ECHO", "ECHO_PATH", my_data);
			var promise_resolved = false;

			promise.then(function(data) {
				expect(data).toEqual(my_data);
				promise_resolved = true;
			});
			$rootScope.$digest();
			expect(promise_resolved).toEqual(true);
		}));

		it('Test setup and send/receive message (delay response)', inject(function($rootScope, ServerSocket) {
			MySocket._delay_response = true;
			MySocket.Connect();
			var my_data = {test: "YES", awesome: "always", scale: 2.0};
			var promise = ServerSocket.send("ECHO", "ECHO_PATH", my_data);
			var promise_resolved = false;

			promise.then(function(data) {
				expect(data).toEqual(my_data);
				promise_resolved = true;
			});
			$rootScope.$digest();
			expect(promise_resolved).toEqual(true);
		}));
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
		var authenticationResolveVerifier;

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

			authenticationResolveVerifier = $injector.get('authenticationResolveVerifier');
		}));

		it('verifies redirection when user not logged in..', inject(function(authentication, $rootScope, $q, $httpBackend) {
			$httpBackend.expectGET('api/ses/verify_session');

			authenticationResolveVerifier($q, $window, authentication).then(function() {
				this.fail(Error("Should not have a sucessful resolve!"));
			}.bind(this), function() {
				expect($window.location.href).toEqual('http://login_url/');
			});

			$httpBackend.flush();
			$rootScope.$digest();
		}));

		it('verifies user logged in is fine.', inject(function(authentication, $rootScope, $q, $httpBackend) {
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

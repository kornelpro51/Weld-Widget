/* global io */

'use strict';

var app = angular.module('WeldSparkApp', [])
	.config(function($routeProvider, $locationProvider) {
		$locationProvider.html5Mode(true).hashPrefix('!'); // TODO: Test and figure out how this works in IE
		$routeProvider
			.when('/:session', {
				templateUrl: 'views/editor.html',
				controller: 'weldEditorController'
			})
			.otherwise({
				redirectTo: '/'
			});
	})
	.factory('socket', function($rootScope) {
		// TODO: Need to figure out how to mock this dependency
		var socket = window.io && io.connect() || {on: function(){}, emit: function() {}};
		return {

			on: function(eventName, callback) {
				socket.on(eventName, function() {
					var args = arguments;
					$rootScope.$apply(function() {
						callback.apply(socket, args);
					});
				});
			},

			emit: function(eventName, data, callback) {
				socket.emit(eventName, data, function() {
					var args = arguments;
					$rootScope.$apply(function() {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				});
			}

		};
	})
	.factory('session', function($routeParams) {
		return {
			sessionId: $routeParams.session
		};
	});

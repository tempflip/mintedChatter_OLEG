var app = angular.module("broadcastExample", []);
var MESSAGE_EVENT = 'MESSAGE_EVENT';

app.controller("breController", function($scope, messenger) {
	$scope.message = "I am empty";

	$scope.$on(MESSAGE_EVENT, function(e, m) {
		$scope.message = m;
	})

	$scope.send = function(m) {
		messenger.message(m);
	}
});

app.factory("messenger", function($rootScope) {
	var factory = {}

	factory.message = function(m) {
		console.log('messenger msg');
		$rootScope.$broadcast(MESSAGE_EVENT, m);
	}

	return factory;
});

app.directive("firstDirective", function(messenger) {
	function link(scope, element, attrs) {
		scope.send = function(m) {
			console.log('directive msg');
			messenger.message(m);
		}
	}
	return {
		restrict : 'E',
		link : link,
		scope : {},
		templateUrl : 'firstDirective.html'
	}
});

app.directive("loggerDirective", function() {
	function link(scope, element, attrs) {
		scope.log = [];
		scope.$on(MESSAGE_EVENT, function(e, m) {
			scope.log.push(m);
		});
	}

	return {
		restrict : 'E',
		link : link,
		scope : {},
		templateUrl : 'loggerDirective.html'
	}
});


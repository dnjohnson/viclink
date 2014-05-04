var angular = require("angular");
var viclink = angular.module("viclink", [ ]);

viclink.controller("VicLinkController", [ "$scope", function ($scope) {
	$scope.test = "hello";
} ]);
var angular = require("angular");

var viclink = angular.module("viclink", [
	require("ui.bootstrap"),
	require("./components/api/api")
]);

viclink.controller("VicLinkController", [ "$scope", "api", function ($scope, api) {
	$scope.test = "hello";

	api.network.get(function (data) {
		$scope.stations = data.stations;
	});
} ]);
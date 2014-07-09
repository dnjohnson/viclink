var angular = require("angular");
var API = angular.module("api", [ ]);

API.factory("api", [ "$http", function ($http) {
	var api = { };

	api.network = {
		get: function (cb) {
			return $http.get("/api/network").success(cb);
		}
	};

	return api;
} ]);

module.exports = API.name;
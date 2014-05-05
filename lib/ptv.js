var qs = require("querystring");
var request = require("request");
var crypto = require("crypto");

var ENDPOINT = "http://timetableapi.ptv.vic.gov.au";
var VERSION = "/v2";

module.exports = function (DEVID, KEY) {
	var ptv = { };

	ptv.request = function (route, params) {
		route = VERSION + route;
		params = params || { };
		params.devid = DEVID;
		params.signature = ptv.sign(route + "?" + qs.stringify(params));

		return request({
			url: ENDPOINT + route,
			qs: params
		});
	};

	ptv.handler = function (req, res) {
		ptv.request(req.url).pipe(res);
	};

	ptv.sign = function (url) {
		var hmac = crypto.createHmac("sha1", KEY);

		hmac.setEncoding("hex");
		hmac.write(url);
		hmac.end();

		return hmac.read().toUpperCase();
	};

	return ptv;
};
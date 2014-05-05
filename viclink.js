/*
	Recuired environment variables:

	http://www.data.vic.gov.au/raw_data/ptv-timetable-api/6056
	PTV_DEVID: Public Transport Victoria Developer ID
	PTV_KEY: Public Transport Victoria Secret Key
*/

var http = require("http");
var jade = require("jade");
var stylus = require("stylus");
var fs = require("fs");
var ecstatic = require("ecstatic")(__dirname + "/build");
var router = require("routes")();
var request = require("request");
var crypto = require("crypto");

var routes = { };

routes.render = function (req, res) {
	res.write(jade.renderFile(__dirname + "/app/viclink.jade"));
	res.end();
};

routes.styles = function (req, res) {
	var styl = fs.readFileSync(__dirname + "/app/" + req.splats + ".styl", "utf8");

	stylus(styl)
		.include(__dirname + "/app/")
		.render(function (err, css) {
			if (err)
				return console.log(err);

			res.write(css);
			res.end();
		});
};

router.addRoute("/", routes.render);
router.addRoute("/*.css", routes.styles);

router.addRoute("/healthcheck", function (req, res) {
	var sig = sign("/v2/healthcheck?devid=" + process.env.PTV_DEVID);

	request({
		url: "http://timetableapi.ptv.vic.gov.au/v2/healthcheck",
		qs: {
			devid: process.env.PTV_DEVID,
			signature: sig
		}
	}).pipe(res);
});

var viclink = http.createServer(function (req, res) {
	var route = router.match(req.url);

	if (route) {
		req.params = route.params;
		req.splats = route.splats;
		route.fn.call(routes, req, res, function () { });
	} else {
		ecstatic(req, res);
	}
});

function sign(url) {
	//console.log("URL", url);
	//console.log("ID", process.env.PTV_DEVID);
	//console.log("KEY", process.env.PTV_KEY);

	var hmac = crypto.createHmac("sha1", process.env.PTV_KEY);
	hmac.setEncoding("hex");
	hmac.write(url);
	hmac.end();

	return hmac.read().toUpperCase();
}

viclink.listen(8000);
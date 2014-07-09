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
var ptv = require("./lib/ptv")(process.env.PTV_DEVID, process.env.PTV_KEY);

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

router.addRoute("/healthcheck", ptv.handler);

router.addRoute("/test", function (req, res) {
	//ptv.request("/nearme/latitude/-37.780167/longitude/144.996728").pipe(res);
	//ptv.request("/search/Westg").pipe(res);

	var TRAIN = 0;
	var WESTGARTH = 1209;
	var HURSTBRIDGE = 8;
	var DIRECTION = 8;

	//ptv.request("/mode/" + TRAIN + "/stop/" + WESTGARTH + "/departures/by-destination/limit/2").pipe(res);
	//ptv.request("/mode/" + TRAIN + "/line/" + HURSTBRIDGE + "/stop/" + WESTGARTH + "/directionid/" + DIRECTION + "/departures/all/limit/2").pipe(res);

	///v2/mode/%@/stop/%@/departures/by-destination/limit/%@?devid=%@&signature=%@
	///search/%@?&devid=%@&signature=%@
	ptv.request("/search/station").pipe(res);
});

router.addRoute("/api/network", function (req, res) {
	res.write(JSON.stringify(require("./data/network.json")));
	res.end();
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

viclink.listen(8000);
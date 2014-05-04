var http = require("http");
var jade = require("jade");
var stylus = require("stylus");
var fs = require("fs");
var ecstatic = require("ecstatic")(__dirname + "/build");
var router = require("routes")();

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
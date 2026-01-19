import toastiebun from ".";

var _404_count = 0;
var _host = "127.0.0.1";
var _port = 3000;

if (process.argv.length > 2) {
	var colonSperator = process.argv[2].indexOf(":");
	if (colonSperator == -1) _host = process.argv[2];
	else {
		_host = process.argv[2].slice(0, colonSperator);
		_port = parseInt(process.argv[2].slice(colonSperator + 1));
	}
}

if (process.argv.length > 3) {
	_port = parseInt(process.argv[3]);
}

new toastiebun.server()
	.get("/", (req, res, next) => {
		// you can provide an error callback
		const hasServedUser = res.sendStatic(`${__dirname}/mockserver/index.html`, err => {
			next();
		});
		// or catch the result of the function call
		if (!hasServedUser) console.log("missing index moving on");
	})
	.get("/static/*", (req, res, next) => {
		res.sendStatic(`${__dirname}/mockserver${req.path}`, () => {
			console.log("missing staticfile, moving on");
			next();
		});
	})
	.get("/fail", (req, res) => {
		// this is another way to handle errors
		res.sendStatic(`${__dirname}/mockserver/`, err => {
			if (err) res.status(404).send(`404 File Not Found\nERR: ${err.message}`);
		});
	})
	.get("/error", (req, res) => {
		throw new Error("Custom Error");
	})
	.get("/async", async (req, res) => {
		await new Promise((res, rej) => {
			setTimeout(res, 1000);
		});
		res.send("waited 1 sec before responding");
	})
	.get("/cookie/:name", (req, res) => {
		res.cookie(req.params.name, "cookie").send("Set a Cookie!");
	})
	.get("/cookie/:name/:value", (req, res) => {
		res.cookie(req.params.name, req.params.value).send("Set a Cookie!");
	})
	.get("/multi-cookie", (req, res) => {
		res.cookie("cookie1", "hi").cookie("cookie2", "hi").send(`Set two Cookies "cookie1" and "cookie2"!`);
	})
	.get("/clear-cookie/:name", (req, res) => {
		res.clearCookie(req.params.name).send("Cleared a Cookie!");
	})
	.get("/cookies", (req, res) => {
		var cookies = req.cookies.entries();
		var ret: { [_: string]: string | boolean } = {};
		for (var cookie of cookies) {
			ret[cookie[0]] = cookie[1];
		}
		res.send(ret);
	})
	.get("/file", (req, res) => {
		// this is another way to handle errors
		res.sendFile(`${__dirname}/mockserver/test.txt`, err => {
			if (err) res.status(404).send(`404 File Not Found\nERR: ${err.message}`);
		});
	})
	.get("/empty", (req, res, next) => {
		res.sendFile(`${__dirname}/mockserver/emptyFile.txt`, err => {
			if (err) next();
		});
	})
	.get("/redirect", (req, res) => {
		res.redirect(`/redirected?=${req.path}`);
	})
	.get("/redirected", (req, res) => {
		res.send("redirected from redirect");
	})
	.get("/long/path", (req, res) => {
		res.send("This is an example long path route");
	})
	.get("/websocket", (req, res, next) => {
		res.sendFile(`${__dirname}/mockserver/websocket.html`, err => {
			if (err) next();
		});
	})
	.websocket("/echo-ws", ws => {
		ws.on("data", data => {
			ws.send(data);
		});
	})
	.get("/say/:word", (req, res) => {
		res.send(req.params.word);
	})
	.get("/form", (req, res, next) => {
		res.sendFile(`${__dirname}/mockserver/form.html`, err => {
			if (err) next();
		});
	})
	.post("/form", async (req, res, next) => {
		var body = new URLSearchParams(await req.text());
		res.send(body);
	})
	.use(
		"/sub",
		new toastiebun.server()
			.get("/", (req, res) => {
				res.sendFile(`${__dirname}/mockserver/subserver.html`, err => {
					if (err) res.status(404).send(`404 File Not Found\nERR: ${err.message}`);
				});
			})
			.get("/*", (req, res) => {
				res.status(404).send("404 on subserver");
			}),
	)
	.get("*", (req, res) => {
		res.status(404).send(`404 File Not Found\ntimes error occured: ${++_404_count}`);
	})
	.error((req, res, err) => {
		console.log(err);
	})
	.listen(_host, _port, server => {
		console.log(`Hosting server @ ${server.host}:${server.port}`);
	});

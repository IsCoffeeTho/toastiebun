import toastiebun from ".";

var _404_count = 0;
var _host = "127.0.0.1";
var _port = 3000;

if (process.argv.length > 2) {
	var colonSperator = process.argv[2].indexOf(":");
	if (colonSperator == -1)
		_host = process.argv[2];
	else {
		_host = process.argv[2].slice(0, colonSperator);
		_port = parseInt(process.argv[2].slice(colonSperator + 1));
	}
}

if (process.argv.length > 3) {
	_port = parseInt(process.argv[3]);
}

new toastiebun.server()
	.get("/fail", (req, res) => {
		// this is another way to handle errors
		res.sendStatic(`${__dirname}/mockserver/`, (err) => {
			res.status(404).send(`404 File Not Found\nERR: ${err.message}`);
		});
	})
	.get("/async", async (req, res) => {
		await new Promise((res, rej) => {
			setTimeout(res, 1000);
		})
		res.send("waited 1 sec before responding");
	})
	.get("/", (req, res, next) => {
		// this can be a way of error handling
		const hasServedUser = res.sendStatic(`${__dirname}/mockserver/index.html`, () => {
			next();
		})
		if (!hasServedUser)
			console.log("missing index moving on");
	})
	.websocket("/echo-ws", (ws) => {
		ws.on("data", (data) => {
			ws.send(data);
		})
	})
	.get("/cookie", (req, res) => {
		res.cookie("test","cookie").send("Set a Cookie!");
	})
	.get("/clear-cookie", (req, res) => {
		res.clearCookie("test").send("Cleared a Cookie!");
	})
	.get("/file", (req, res) => {
		// this is another way to handle errors
		res.sendFile(`${__dirname}/mockserver/test.txt`, (err) => {
			res.status(404).send(`404 File Not Found\nERR: ${err.message}`);
		});
	})
	.get("/redirect", (req, res) => {
		res.redirect(`/redirected?=${req.path}`);
	})
	.get("/redirected", (req, res) => {
		res.send("redirected from redirect");
	})
	.get("/empty", (req, res) => {
		res.sendFile(`${__dirname}/mockserver/emptyFile.txt`, (err) => {
			res.status(404).send(`404\nThe file exists but is empty\n\nHand Written Error`);
		});
	})
	.get("/long/path", (req, res) => {
		res.send("This is an example long path route");
	})
	.get("/say/:word", (req, res) => {
		res.send(req.params.word)
	})
	.use("/sub", new toastiebun.server()
		.get("/", (req, res) => {
			res.sendFile(`${__dirname}/mockserver/subserver.html`, (err) => {
				res.status(404).send(`404 File Not Found\nERR: ${err.message}`);
			});
		})
		.get("/*", (req, res) => {
			res.status(404).send("404 on subserver")
		})
	)
	.get("*", (req, res) => {
		res.status(404).send(`404 File Not Found\ntimes error occured: ${++_404_count}`);
	})
	.listen(_host, _port, (server) => {
		console.log(`Hosting server @ ${server.host}:${server.port}`);
	});
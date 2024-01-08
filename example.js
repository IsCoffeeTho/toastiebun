import toastieBun from ".";

var _404_count = 0;
var _host = "10.0.0.95";
var _port = 3000;

if (process.argv.length > 2) {
	_host = process.argv[2];
}

if (process.argv.length > 3) {
	_port = parseInt(process.argv[3]);
}

new toastieBun.server()
	.get("/", (req, res, next) => {
		// this can be a way of error handling
		const hasServedUser = res.sendFile(`${__dirname}/mockserver/index.html`, () => {
			next();
		})
		if (!hasServedUser)
			console.log("missing index moving on");
	})
	.get("/file", (req, res) => {
		// this is another way to handle errors
		res.sendFile(`${__dirname}/mockserver/test.txt`, (err) => {
			res.status(404).send(`404 File Not Found\nERR: ${err.message}`);
		});
	})
	.get("/empty", (req, res) => {
		res.sendFile(`${__dirname}/mockserver/emptyFile.txt`, (err) => {
			res.status(404).send(`404\nThe file exists but is empty\n\nHand Written Error`);
		});
	})
	.get("/long/path", (req, res) => {
		res.send("This is an example long path route");
	})
	.use(["/sub", "/subserver"], new toastieBun.server()
		.get("/", (req, res) => {
			res.sendFile(`${__dirname}/mockserver/subserver.html`, (err) => {
				res.status(404).send(`404 File Not Found\nERR: ${err.message}`);
			});
		})
		.get("*", (req, res) => {
			res.status(404).send("404 on subserver")
		})
	)
	.get("*", (req, res) => {
		res.status(404).send(`404 File Not Found\ntimes error occured: ${++_404_count}`);
	})
	.listen(_host, _port, (server) => {
		console.log(`Hosting server @ ${server.host}:${server.port}`);
	});
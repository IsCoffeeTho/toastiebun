import toastieBun from ".";

var viewCount = 0;
var errorCount = 0;

const server = new toastieBun.server()
	.get("/", (req, res) => {
		res.send(`Example Server using the ToastieBun Framework\nviews: ${++viewCount}`);
	})
	.get("/file", (req, res) => {
		res.sendFile(`${__dirname}/mockserver/test.txt`, () => {
			res.status(404).send("404 File Not Found");
		});
	})
	.use(["/sub", "/subserver"], new toastieBun.server()
		.get("/", (req, res) => {
			res.send("Sub Server")
		})
		.get("*", (req, res) => {
			res.status(404).send("404 on subserver")
		})
	)
	.get("*", (req, res) => {
		res.status(404).send(`404 File Not Found\ntimes error occured: ${++errorCount}`);
	})
	.listen("127.0.0.1", 3000, (server) => {
		console.log(`Hosting server @ ${server.host}:${server.port}`);
	});
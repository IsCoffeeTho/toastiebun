import { beforeAll, expect, mock, test } from "bun:test";
import toastie from "..";

const mockhost = "127.0.0.1";
const mockport = Math.floor(Math.random() * 9999) + 1000;

const endpoint = `http://${mockhost}:${mockport}`;
const wsendpoint = `ws://${mockhost}:${mockport}`;

var dynamicCounter = 0;

const middleware = new toastie.server();

const mockserver = new toastie.server()
	.get("/", (req, res) => {
		res.send("TEST SERVER");
	})
	.get("/async", async (req, res) => {
		await new Promise((res, rej) => {
			setTimeout(res, 50);
		})
		res.send("waited 50ms before responding");
	})
	.websocket("/echo-ws", (ws) => {		
		ws.on("data", (data) => {
			ws.send(data);
			if (data.toString() == "exit")
				ws.close();
		})
	})
	.get("/test-route", (req, res) => {
		res.send("Success for Test Route");
	})
	.get("/another-test-route", (req, res) => {
		res.send("Success for Test Route again");
	})
	.get("/json-test", (req, res) => {
		res.send({
			test: "json"
		});
	})
	.get("/test-file", (req, res) => {
		res.sendFile(`${__dirname}/../mockserver/test.txt`, () => { res.status(404).send("404"); });
	})
	.get("/missing-file", (req, res) => {
		res.sendFile(`${__dirname}/../mockserver/doesnt-exist.test`, () => { res.status(404).send("404"); });
	})
	.get("/appliance", (req, res) => {
		res.status(418).send("Short and Stout");
	})
	.get("/increment", (req, res) => {
		res.send(`${++dynamicCounter}`);
	})
	.get("/decrement", (req, res) => {
		res.send(`${--dynamicCounter}`);
	})
	.get("/redirect", (req, res) => {
		res.redirect(`/redirected`);
	})
	.get("/redirected", (req, res) => {
		res.send("PASS");
	})
	.get("/say/:word", (req, res) => {
		res.send(req.params.word)
	})
	.get("/cookie/:name/:word", (req, res) => {
		res.cookie(req.params.name, req.params.word)
			.send(`set ${req.params.name}: ${req.params.word}`);
	})
	.get("/clear-cookie/:name/", (req, res) => {
		res.clearCookie(req.params.name)
			.send(`cleared ${req.params.name}`);
	})
	.post("/post", async (req, res) => {
		res.send(await req.text());
	})
	.use(middleware)
	.get("*", (req, res) => {
		res.status(404).send("404");
	});

beforeAll(async () => {
	mockserver.listen(mockhost, mockport, () => {
		console.log("Server Hooked!");
	});	
});


export {
	mockhost,
	mockport,
	mockserver,
	endpoint
}
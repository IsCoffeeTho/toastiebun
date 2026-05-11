import { beforeAll, expect, mock, test } from "bun:test";
import toastie from "..";

const mockhost = "127.0.0.1";
const mockport = Math.floor(Math.random() * 9999) + 1000;

const endpoint = `http://${mockhost}:${mockport}`;
const wsendpoint = `ws://${mockhost}:${mockport}`;

var dynamicCounter = 0;

const middleware = new toastie.Server();

const mockserver = new toastie.Server({
	cors: {
		origins: ["*"],
	},
})
	.get("/", (req, res) => {
		res.send("TEST SERVER");
	})
	.get("/test-route", (req, res) => {
		res.send("Success for Test Route");
	})
	.get("/another-test-route", (req, res) => {
		res.send("Success for Test Route again");
	})
	.get("/json-test", (req, res) => {
		res.send({
			test: "json",
		});
	})
	.get("/test-file", (req, res) => {
		res.sendFile(`${__dirname}/../mockserver/test.txt`, () => {
			res.status(404).send("404");
		});
	})
	.get("/missing-file", (req, res) => {
		res.sendFile(`${__dirname}/../mockserver/doesnt-exist.test`, () => {
			res.status(404).send("404");
		});
	})
	.get("/error", (req, res) => {
		throw new Error("expected fail");
	})
	.get("/appliance", (req, res) => {
		res.status(418).send("Short and Stout");
	})
	.get("/async", async (req, res) => {
		await new Promise((res, rej) => {
			setTimeout(res, 50);
		});
		res.send("waited 50ms before responding");
	})
	.websocket("/echo-ws-ev", ws => {
		ws.on("data", data => {
			ws.send(data);
			if (data.toString() == "exit") ws.close();
		});
	})
	.websocket("/echo-ws-rd", async ws => {
		while (true) {
			var data = await ws.read();
			ws.send(data);
			if (data.toString() == "exit") return ws.close();
		}
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
		res.send(req.params.word);
	})
	.get("/cookie/:name/:word", (req, res) => {
		res.cookie(req.params.name, req.params.word, { path: "/" }).send(`set ${req.params.name}: ${req.params.word}`);
	})
	.get("/cookies", (req, res) => {
		var cookies = req.cookies.entries();
		var ret: { [_: string]: string | boolean } = {};
		for (var cookie of cookies) {
			ret[cookie[0]] = cookie[1];
		}
		res.send(ret);
	})
	.get("/multi-cookie", (req, res) => {
		res.cookie("cookie1", "value1", { path: "/" }).cookie("cookie2", "value2", { path: "/" }).send(`set ${req.params.name}: ${req.params.word}`);
	})
	.get("/clear-cookie/:name", (req, res) => {
		res.clearCookie(req.params.name).send(`cleared ${req.params.name}`);
	})
	.post("/post", async (req, res) => {
		res.send(await req.text());
	})
	.use(middleware)
	.options("/cors/anyOrigin", {
		origins: ["*"],
		allowHeaders: ["Content-Type"],
	})
	.get("/cors/anyOrigin", (req, res) => {
		res.send("OK!");
	})
	.options("/cors/specificOrigin", {
		origins: ["http://localhost:3000"],
		allowHeaders: ["Content-Type"],
	})
	.get("/cors/specificOrigin", (req, res) => {
		res.send("OK!");
	})
	.options("/cors/varyOrigin", {
		origins: ["http://localhost:8000", "http://localhost:3000"],
		allowHeaders: ["Content-Type"],
	})
	.get("/cors/varyOrigin", (req, res) => {
		res.send("OK!");
	})
	.options("/cors/headers", {
		allowHeaders: ["Content-Type", "Accepts"],
	})
	.get("/cors/headers", (req, res) => {
		res.send("OK!");
	})
	.options("/cors/badHeaders", {
		// nothing
	})
	.get("/cors/badHeaders", (req, res) => {
		res.send("OK!");
	})
	// .options is not required to allow "OPTIONS" method for an endpoint
	.get("/cors/methods", (req, res) => {
		res.send("OK!");
	})
	.post("/cors/methods", (req, res) => {
		res.send("OK!");
	})
	.options("/cors/maxAge", {
		maxAge: 60 * 60, // 1 hour
	})
	.get("/cors/maxAge", (req, res) => {
		res.send("OK!");
	})
	.options("*", null)
	.get("*", (req, res) => {
		res.status(404).send("404");
	})
	.error((req, res, err) => {
		res.status(500).send("Error endpoint");
		console.log(err);
	});

beforeAll(async () => {
	mockserver.listen(mockhost, mockport, () => {
		console.log("Server Hooked!");
	});
});

export { mockhost, mockport, mockserver, endpoint };

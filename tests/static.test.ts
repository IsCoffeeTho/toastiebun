import { expect, test } from "bun:test";
import { endpoint } from "./mockserver";
import { WebSocket } from "ws";

test("Text", async () => {
	expect(await (await fetch(`${endpoint}/`)).text())
		.toBe("TEST SERVER");
	expect(await (await fetch(`${endpoint}/test-route`)).text())
		.toBe("Success for Test Route");
	expect(await (await fetch(`${endpoint}/another-test-route`)).text())
		.toBe("Success for Test Route again");
	expect(await (await fetch(`${endpoint}/test-file`)).text())
		.toBe("This text is from a file");
});

test("Parameters", async () => {
	expect(await (await fetch(`${endpoint}/say/test`)).text())
		.toBe("test");
	expect(await (await fetch(`${endpoint}/say/example`)).text())
		.toBe("example");
});

test("JSON", async () => {
	var jsonfetch = await fetch(`${endpoint}/json-test`);
	expect((jsonfetch).headers.get("Content-Type"))
		.toBe("application/json");

	var jsontest = <any>(await (jsonfetch).json());
	expect(jsontest)
		.toHaveProperty("test");
	expect(jsontest["test"])
		.toBe("json");
});

test("Websocket", async () => {
	var websocket = new WebSocket(`${endpoint}/echo-ws`);
	websocket.onopen = async () => {
		var awaitMessage = () => {
			return new Promise<string | Buffer>((res, rej) => {
				websocket.onmessage = (event) => {
					res(event.data);
				};
				websocket.onerror = () => {
					rej();
				}
			});
		}
		websocket.send("hi");
		expect(await awaitMessage()).toBe("hi");
		var randomNumber = (Math.random() * (10 ** 6)).toString();
		websocket.send(randomNumber);
		expect(await awaitMessage()).toBe(randomNumber);
	};
});

test("async", async () => {
	expect((await fetch(`${endpoint}/async`)).status)
		.toBe(200);
});
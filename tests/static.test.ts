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

test("JSON", async () => {
	var jsonfetch = await fetch(`${endpoint}/json-test`);
	expect(await (jsonfetch).headers.get("Content-Type"))
		.toBe("application/json");

	var jsontest = await (jsonfetch).json()
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
		var randomNumber = (Math.random()*(10**6)).toString();
		websocket.send(randomNumber);
		expect(await awaitMessage()).toBe(randomNumber);
	};
});
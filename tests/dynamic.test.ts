import { endpoint } from "./mockserver.test";
import { expect, test } from "bun:test";
import WebSocket from "ws";

test("Dynamic Content", async () => {
	expect(await (await fetch(`${endpoint}/increment`)).text()).toBe("1");
	await fetch(`${endpoint}/increment`);
	expect(await (await fetch(`${endpoint}/increment`)).text()).toBe("3");
	expect(await (await fetch(`${endpoint}/decrement`)).text()).toBe("2");
});

test("Parameters", async () => {
	expect(await (await fetch(`${endpoint}/say/test`)).text()).toBe("test");
	expect(await (await fetch(`${endpoint}/say/example`)).text()).toBe(
		"example",
	);
});

test("Cookies", async () => {
	var cookies: string[] = [];

	async function makeRequest(_endpoint: string) {
		return (
			await fetch(_endpoint, {
				headers: {
					cookie: `${cookies.join("; ")}`,
				},
			})
		).headers.getSetCookie();
	}

	expect(
		await makeRequest(`${endpoint}/cookie/testCookie1/testValue1`),
	).toEqual(["testCookie1=testValue1; Path=/"]);

	expect(
		await makeRequest(`${endpoint}/cookie/testCookie2/testValue2`),
	).toEqual(["testCookie2=testValue2; Path=/"]);

	expect(await makeRequest(`${endpoint}/multi-cookie`)).toEqual([
		"cookie1=value1; Path=/",
		"cookie2=value2; Path=/",
	]);

	expect(await makeRequest(`${endpoint}/clear-cookie/testCookie1`)).toEqual(["testCookie1=; Max-Age=0; Path=/"]);

	expect(await makeRequest(`${endpoint}/clear-cookie/cookie2`)).toEqual(["cookie2=; Max-Age=0; Path=/"]);

	expect(await makeRequest(`${endpoint}/clear-cookie/nothing`)).toEqual(["nothing=; Max-Age=0; Path=/"]);
});

test("POST", async () => {
	expect(
		await (
			await fetch(`${endpoint}/post`, {
				method: "POST",
				body: "Test Data",
			})
		).text(),
	).toBe("Test Data");
});

test("WebSocket", async () => {
	var socket = new WebSocket(`${endpoint}/echo-ws`);
	expect(socket).toBeInstanceOf(WebSocket);
	await new Promise((res, rej) => {
		socket.once("open", () => {
			res(0);
		});
		socket.once("error", (err) => {
			rej(err);
		});
		socket.once("close", (c, r) => {
			rej(r.toString());
		});
	});
	expect(socket.readyState).toBe(WebSocket.OPEN);
});

test("WebSocket Echo", async () => {
	var websocket = new WebSocket(`${endpoint}/echo-ws`);
	websocket.onopen = async () => {
		try {
			var awaitMessage = () => {
				return new Promise<any>((res, rej) => {
					websocket.onmessage = (event) => {
						res(event.data);
					};
					websocket.onerror = () => {
						rej();
					};
					websocket.onclose = () => {
						rej("closed");
					};
				});
			};
			websocket.send("hi");
			expect(await awaitMessage()).toBe("hi");
			var randomNumber = (Math.random() * 10 ** 6).toString();
			websocket.send(randomNumber);
			expect(await awaitMessage()).toBe(randomNumber);
			websocket.send("exit");
			expect(await awaitMessage()).toBe("exit");

			expect(await awaitMessage()).toThrow("closed");
		} catch (err) {
			websocket.close();
		}
	};
});

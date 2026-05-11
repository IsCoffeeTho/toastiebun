import { endpoint } from "./mockserver.test";
import { expect, test } from "bun:test";
import WebSocket from "ws";

class WebSocketTester extends WebSocket {
	constructor(endpoint: string) {
		super(endpoint);
	}
	
	async awaitOpen() {
		return new Promise((res, rej) => {
			if (this.readyState == WebSocket.OPEN)
				return res(true);
			this.onopen = res;
			this.onerror = rej;
		});
	}
	
	async read() {
		var unexpectedClosure = new Error("WebSocket closed unexpectedly");
		return new Promise((res, rej) => {
			if (this.readyState != WebSocket.OPEN)
				return rej(unexpectedClosure);
			this.onmessage = ev => res(ev.data.toString());
			this.onerror = ev => rej(ev.error);
			this.onclose = ev => rej(unexpectedClosure);
		});
	}
}

test("GET WebSocket Endpoint", async () => {
	var response_event_based = await fetch(`${endpoint}/echo-ws-ev`);
	expect(response_event_based.status, `Websocket Endpoint responded as an HTTP endoint`).not.toBeWithin(200, 299);
	expect(response_event_based.status, `Websocket Endpoint falsely upgraded an HTTP request`).not.toBe(101);
	
	var response_reader_based = await fetch(`${endpoint}/echo-ws-rd`);
	expect(response_reader_based.status, `Websocket Endpoint responded as an HTTP endoint`).not.toBeWithin(200, 299);
	expect(response_reader_based.status, `Websocket Endpoint falsely upgraded an HTTP request`).not.toBe(101);
	
});

test("WebSocket Event based", async () => {
	var socket = new WebSocketTester(`${endpoint}/echo-ws-ev`);
	await socket.awaitOpen();
	
	socket.send("hi");
	expect(await socket.read(), `Failed to echo`).toBe("hi");
	expect(socket.readyState, `Connection was unexpectedly closed`).toBe(WebSocket.OPEN);
	
	var randomNumber = (Math.random() * 10 ** 6).toString();
	socket.send(randomNumber);
	expect(await socket.read(), `Failed to echo`).toBe(randomNumber);
	expect(socket.readyState, `Connection was unexpectedly closed`).toBe(WebSocket.OPEN);
	
	socket.send("exit");
	expect(await socket.read(), `Failed to echo`).toBe("exit");
	
	await socket.read().catch(_ => _);
	
	expect(socket.readyState, `Connection failed to close from message`).toBeOneOf([WebSocket.CLOSING, WebSocket.CLOSED]);
});

test("WebSocket Reader based", async () => {
	var socket = new WebSocketTester(`${endpoint}/echo-ws-rd`);
	await socket.awaitOpen();

	socket.send("hi");
	expect(await socket.read(), `Failed to echo`).toBe("hi");
	expect(socket.readyState, `Connection was unexpectedly closed`).toBe(WebSocket.OPEN);
	
	var randomNumber = (Math.random() * 10 ** 6).toString();
	socket.send(randomNumber);
	expect(await socket.read(), `Failed to echo`).toBe(randomNumber);
	expect(socket.readyState, `Connection was unexpectedly closed`).toBe(WebSocket.OPEN);
	
	socket.send("exit");
	expect(await socket.read(), `Failed to echo`).toBe("exit");
	
	await socket.read().catch(_ => _);
	
	expect(socket.readyState, `Connection failed to close from message`).toBeOneOf([WebSocket.CLOSING, WebSocket.CLOSED]);
});

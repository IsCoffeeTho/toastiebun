import { expect, test } from "bun:test";
import { onready, mockhost, mockport, begin } from "./server.test";

onready(() => {
	var endpoint = `http://${mockhost}:${mockport}`;
	console.log(`Testing Hook ${endpoint}`);

	test("Static Routes", async () => {
		expect(await (await fetch(`${endpoint}/`)).text())
			.toBe("TEST SERVER");
		expect(await (await fetch(`${endpoint}/test-route`)).text())
			.toBe("Success for Test Route");
		expect(await (await fetch(`${endpoint}/another-test-route`)).text())
			.toBe("Success for Test Route again");
		expect(await (await fetch(`${endpoint}/test-file`)).text())
			.toBe("This text is from a file");
		var jsonfetch = await fetch(`${endpoint}/json-test`);
		expect(await (jsonfetch).headers.get("Content-Type"))
			.toBe("application/json");
		var jsontest = await (jsonfetch).json()
		expect(jsontest)
			.toHaveProperty("test");
		expect(jsontest["test"])
			.toBe("json");

	});

	test("Dynamic Content", async () => {
		expect(await (await fetch(`${endpoint}/increment`)).text())
			.toBe("1");
		await fetch(`${endpoint}/increment`);
		expect(await (await fetch(`${endpoint}/increment`)).text())
			.toBe("3");
		expect(await (await fetch(`${endpoint}/decrement`)).text())
			.toBe("2");
	});

	test("Failed to sendFile", async () => {
		expect((await fetch(`${endpoint}/missing-file`)).status)
			.toBe(404);
	});

	test("I am a teapot", async () => {
		var resp = await fetch(`${endpoint}/appliance`)
		expect(resp.status)
			.toBe(418);
		expect(await resp.text())
			.toBe("Short and Stout");
	});

	test("HTTP Status Codes", async () => {
		expect((await fetch(`${endpoint}/`)).status)
			.toBe(200);
		expect((await fetch(`${endpoint}/404`)).status)
			.toBe(404);
		expect((await fetch(`${endpoint}/`, { method: "POST" })).status)
			.toBe(405);
	});

});

begin();
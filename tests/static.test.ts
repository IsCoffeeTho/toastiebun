import { expect, test } from "bun:test";
import { endpoint } from "./mockserver.test";

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
	expect((jsonfetch).headers.get("Content-Type"))
		.toBe("application/json");

	var jsontest = <any>(await (jsonfetch).json());
	expect(jsontest)
		.toHaveProperty("test");
	expect(jsontest["test"])
		.toBe("json");
});

test("404", async () => {
	expect((await fetch(`${endpoint}/not-a-handled-path`)).status)
		.toBe(404);
});

test("async", async () => {
	expect((await fetch(`${endpoint}/async`)).status)
		.toBe(200);
});
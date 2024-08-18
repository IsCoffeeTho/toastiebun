import { expect, test } from "bun:test";
import { endpoint } from "./mockserver";

test("Dynamic Content", async () => {
	expect(await (await fetch(`${endpoint}/increment`)).text())
		.toBe("1");
	await fetch(`${endpoint}/increment`);
	expect(await (await fetch(`${endpoint}/increment`)).text())
		.toBe("3");
	expect(await (await fetch(`${endpoint}/decrement`)).text())
		.toBe("2");
});

test("Parameters", async () => {
	expect(await (await fetch(`${endpoint}/say/test`)).text())
		.toBe("test");
	expect(await (await fetch(`${endpoint}/say/example`)).text())
		.toBe("example");
});

test("Cookies", async () => {
	expect((await fetch(`${endpoint}/cookie/test/test`)).headers.getSetCookie())
		.toEqual(["test=test"]);
	expect((await fetch(`${endpoint}/clear-cookie/test`)).headers.getSetCookie())
		.toEqual([]); // fetch wont let me test the exact functionality but oh well

});
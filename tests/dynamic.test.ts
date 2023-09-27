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

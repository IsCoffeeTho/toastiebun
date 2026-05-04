import { expect, test } from "bun:test";
import { endpoint } from "./mockserver.test";

test("Allowed Origins", async () => {
	var response = await fetch(`${endpoint}/cors/origin`, {
		method: "OPTIONS",
	});
	expect(response.status, `/cors/headers responded with an error`).toBe(200);
	expect(response.headers.has("Access-Control-Allow-Origin"), `/cors/origin is missing a critical header`).toBeTrue();
	let accessControlAllowOrigin = response.headers.get("Access-Control-Allow-Origin");

	/** @TODO */
});

test("Allowed Methods", async () => {
	var response = await fetch(`${endpoint}/cors/methods`, {
		method: "OPTIONS",
	});
	expect(response.status, `/cors/methods responded with an error`).toBe(200);
	expect(response.headers.has("Access-Control-Allow-Methods"), `/cors/methods is missing a critical header`).toBeTrue();
	let accessControlAllowMethods = response.headers.get("Access-Control-Allow-Methods");

	/** @TODO */
});

test("Allowed Headers", async () => {
	var response = await fetch(`${endpoint}/cors/headers`, {
		method: "OPTIONS",
	});
	expect(response.status, `/cors/headers responded with an error`).toBe(200);
	expect(response.headers.has("Access-Control-Allow-Headers"), `/cors/headers is missing a critical header`).toBeTrue();
	let accessControlAllowHeaders = response.headers.get("Access-Control-Allow-Headers");

	/** @TODO */
});

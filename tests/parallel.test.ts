import { endpoint } from "./mockserver.test";
import { expect, test } from "bun:test";

test("Two parallel requests", async () => {
	var requests = [
		fetch(`${endpoint}/`),
		fetch(`${endpoint}/`)
	];
	
	await Promise.allSettled(requests);
	
	requests.forEach(async request => {
		var response = await request;
		expect(response.status, `One of the requests failed`).toBe(200);
	});
	
});

test("Five parallel requests", async () => {
	var requests = [
		fetch(`${endpoint}/`),
		fetch(`${endpoint}/`),
		fetch(`${endpoint}/`),
		fetch(`${endpoint}/`),
		fetch(`${endpoint}/`)
	];
	
	await Promise.allSettled(requests);
	
	requests.forEach(async (request, i, a) => {
		var response = await request;
		expect(response.status, `Request ${i} failed`).toBe(200);
	});
});

test("Five parallel agents", async () => {
	var requests = [
		fetch(`${endpoint}/`),
		fetch(`${endpoint}/test-route`),
		fetch(`${endpoint}/another-test-route`),
		fetch(`${endpoint}/json-test`),
		fetch(`${endpoint}/redirected`)
	];
	
	await Promise.allSettled(requests);
	
	requests.forEach(async (request, i, a) => {
		var response = await request;
		expect(response.status, `Request ${i} failed`).toBe(200);
	});
});


test("Five parallel async requests", async () => {
	var requests = [
		fetch(`${endpoint}/async`),
		fetch(`${endpoint}/async`),
		fetch(`${endpoint}/async`),
		fetch(`${endpoint}/async`),
		fetch(`${endpoint}/async`)
	];
	
	await Promise.allSettled(requests);
	
	requests.forEach(async (request, i, a) => {
		var response = await request;
		expect(response.status, `Request ${i} failed`).toBe(200);
	});
});

const bigCount = 50;

test(`${bigCount} parallel async requests`, async () => {
	var requests = "0".repeat(bigCount).split("").map(v => fetch(`${endpoint}/async`));
	
	await Promise.allSettled(requests);
	
	requests.forEach(async (request, i, a) => {
		var response = await request;
		expect(response.status, `Request ${i} failed`).toBe(200);
	});
});
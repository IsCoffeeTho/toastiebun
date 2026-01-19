import { expect, test } from "bun:test";
import { endpoint } from "./mockserver.test";

test("Text", async () => {
	var response = await fetch(`${endpoint}/`);
	expect(response.status, `Test Route / failed`).toBe(200);
	expect(await response.text(), `Mismatch of response data at /`).toBe("TEST SERVER");

	response = await fetch(`${endpoint}/test-route`);
	expect(response.status, `Test Route /test-route failed`).toBe(200);
	expect(await response.text()).toBe("Success for Test Route");

	response = await fetch(`${endpoint}/another-test-route`);
	expect(response.status, `Test Route /another-test-route failed`).toBe(200);
	expect(await response.text()).toBe("Success for Test Route again");

	response = await fetch(`${endpoint}/test-file`);
	expect(response.status, `Test Route /test-file failed`).toBe(200);
	expect(await response.text()).toBe("This is a text file example for the library toastiebun");
});

test("JSON", async () => {
	var response = await fetch(`${endpoint}/json-test`);
	expect(response.status, `Test Route /json-test failed`).toBe(200);
	expect(response.headers.get("Content-Type"), `JSON Response failed to provide the json MIME type`).toBe("application/json");

	var data = await response.json();
	expect(data, `Missing test property key`).toHaveProperty("test");
	expect(data["test"], `Mismatch test property value`).toBe("json");
});

test("404", async () => {
	var response = await fetch(`${endpoint}/not-a-handled-path`);
	expect(response.status, `Responded to a garunteed 404 with ${response.status}`).toBe(404);
});

test("redirection", async () => {
	const request = await fetch(`${endpoint}/redirect`);
	expect(request.redirected, `Failed to redirect a regular http user agent`).toBe(true);
	expect(request.url, `Redirected to the wrong endpoint /redirect`).toBe(`${endpoint}/redirected`);
});

test("async", async () => {
	const allocatedTime = 50;
	const timeoutTime = 100;

	var tookAwaitedTime = false;
	var preTimer = setTimeout(() => {
		tookAwaitedTime = true;
	}, allocatedTime);
	var tookTooLong = false;
	var postTimer = setTimeout(() => {
		tookTooLong = true;
	}, timeoutTime);

	var response = await fetch(`${endpoint}/async`);
	preTimer.close();
	postTimer.close();

	expect(response.status, `Endpoint /async failed`).toBe(200);

	expect(tookAwaitedTime, `Server responded too quick to /async`).toBeTrue();
	expect(tookTooLong, `Server took too long to respond to /async`).toBeFalse();
});

test("error", async () => {
	var response = await fetch(`${endpoint}/error`);
	expect(response.status, `/error responded with a success`).toBe(500);
	expect(response.headers.get("Content-Type"), `/error reponded with incorrect content-type`).toBe("text/plain");

	var body = await response.text();

	expect(body, `/error responded incorrectly`).toBe("Error endpoint");
});

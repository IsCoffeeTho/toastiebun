import { expect, test } from "bun:test";
import { endpoint } from "./mockserver.test";

test("CORS Origin Wildcard", async () => {
	let response = await fetch(`${endpoint}/cors/anyOrigin`, { headers: { origin: "http://random.com" } });
	expect(response.status, `Test Route /cors/anyOrigin failed`).toBe(200);
	expect(response.headers.get("access-control-allow-origin")).toBe("*");
});

test("CORS Origin Specific", async () => {
	let response = await fetch(`${endpoint}/cors/specificOrigin`, { headers: { origin: "http://localhost:3000" } });
	expect(response.status, `Test Route /cors/specificOrigin failed`).toBe(200);
	expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
});

test("CORS Vary Origin", async () => {
	let response = await fetch(`${endpoint}/cors/varyOrigin`, { headers: { origin: "http://localhost:3000" } });
	expect(response.status, `Test Route /cors/varyOrigin failed`).toBe(200);
	expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
});

test("CORS with Methods", async () => {
	let response = await fetch(`${endpoint}/cors/methods`, { method: "OPTIONS", headers: { origin: "http://localhost:3000" } });

	// console.log(response);
	
	expect(response.status, `Test Route /cors/methods failed`).toBe(200);

	let allowedMethodsHeader = response.headers.get("access-control-allow-methods");
	expect(allowedMethodsHeader).not.toBeNull();
	let allowedMethods = (<string>allowedMethodsHeader).split(",").map(v => v.trim());

	expect(allowedMethods).toContain("GET");
	expect(allowedMethods).toContain("POST");
});

test("CORS with Headers", async () => {
	let response = await fetch(`${endpoint}/cors/headers`, { headers: { origin: "http://localhost:3000", "content-type": "application/json" } });

	expect(response.status, `Test Route /cors/headers failed`).toBe(200);

	var allowedHeadersHeader = response.headers.get("access-control-allow-headers");
	expect(allowedHeadersHeader).not.toBeNull();
	let allowedHeaders = (<string>allowedHeadersHeader).split(",").map(v => v.trim());

	expect(allowedHeaders).toContain("Content-Type");
});

test("CORS with Invalid Headers", async () => {
	let response = await fetch(`${endpoint}/cors/badHeaders`, { headers: { origin: "http://localhost:3000", "content-type": "application/json" } });

	expect(response.status, `Test Route /cors/badHeaders failed`).toBe(200);

	var allowedHeadersHeader = response.headers.get("access-control-allow-headers");
	expect(allowedHeadersHeader).toBeNull();
});

test("CORS with Max Age Header", async () => {
	let response = await fetch(`${endpoint}/cors/maxAge`, { headers: { origin: "http://localhost:3000" } });

	expect(response.status, `Test Route /cors/maxAge failed`).toBe(200);

	var maxAgeHeader = response.headers.get("access-control-max-age");
	expect(maxAgeHeader).not.toBeNull();

	expect(Number.parseInt(<string>maxAgeHeader)).toBeGreaterThan(0);
});

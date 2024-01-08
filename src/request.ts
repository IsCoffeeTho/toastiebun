/// <reference path="toastiebun.ts" />
import { toastiebun } from "./toastiebun";

export default class request implements toastiebun.request {
	#parent: toastiebun.server;
	#method: toastiebun.method;
	#text: () => Promise<string>;
	#json: () => Promise<any>;
	baseUrl: string;
	path: string;
	cookies: { [key: string]: (string | boolean) };
	routeStack: string[];
	#stale: boolean;
	#fields: { [field: string]: string };
	#bunReq: Request;
	protocol: "http" | "https" | "ws";
	res: toastiebun.response;
	params: { [key: string]: string; };
	query: { [key: string]: string; };
	constructor(parent: toastiebun.server, req: Request, res: toastiebun.response) {
		this.#parent = parent;
		this.#bunReq = req;
		this.baseUrl = this.#bunReq.url;
		this.path = new URL(this.#bunReq.url).pathname;
		this.#method = <toastiebun.method>this.#bunReq.method;
		this.#text = this.#bunReq.text;
		this.#json = this.#bunReq.json;
		this.cookies = {};
		var cookieHeader = this.#bunReq.headers.get("Cookie");
		if (cookieHeader)
			cookieHeader.split(';').forEach((cookie) => {
				var key = cookie;
				var value: string | boolean = true;
				var equals = cookie.indexOf('=');
				if (equals != -1) {
					key = cookie.slice(0, equals);
					value = cookie.slice(equals + 1);
				}
				this.cookies[key] = value;
			});
		this.routeStack = [];
		if (this.get("Cache-Control") == 'no-cache')
			this.#stale = true;
		this.#stale = true;
		this.#fields = {};
	}

	get ip() { return this.#bunReq.destination; }

	get app() { return this.#parent; }

	get method() { return this.#method; }

	get fresh() { return !this.#stale; }

	/**
	 * Indicates whether the request is “stale,” and is the opposite of {@link fresh}.
	 * @see {@link fresh}
	 */
	get stale() { return this.#stale; }

	/**
	 *  Read HTTP header from the request
	 * 
	 * @implements {Headers.get}
	 *  @see {@linkcode bun-types/types.d.ts:23237}
	 */
	get(field: string) {
		return this.#bunReq.headers.get(field);
	}

	text() {
		return this.#text();
	}


	json() {
		return this.#json();
	}
}
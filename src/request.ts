/// <reference path="toastiebun.d.ts" />
import { Server } from "bun";
import { toastiebun } from "./toastiebun";
import websocket from "./websocket";

export default class request implements toastiebun.request {
	#parent: toastiebun.server;
	#method: toastiebun.method;
	baseUrl: string;
	path: string;
	cookies: Map<string, string | boolean>;
	routeStack: toastiebun.handleDescriptor[];
	#stale: boolean;
	#fields: { [field: string]: string };
	#bunReq: Request;
	res: toastiebun.response;
	params: { [key: string]: string; };
	query: URLSearchParams;
	originalUrl: string;
	hostname: string;
	data: any;
	constructor(parent: toastiebun.server, req: Request, res: toastiebun.response) {
		this.#parent = parent;
		this.#bunReq = req;
		this.baseUrl = this.#bunReq.url;
		const urlobj = new URL(this.#bunReq.url)
		this.path = urlobj.pathname;
		this.#method = <toastiebun.method>this.#bunReq.method;
		this.params = {}; // TODO: implement
		this.query = urlobj.searchParams;
		this.res = res;
		this.cookies = new Map<string, string | boolean>();
		var cookieHeader = this.#bunReq.headers.get("Cookie");
		// console.log(cookieHeader);
		if (cookieHeader)
			cookieHeader.split(';').forEach((cookie) => {
				var key = cookie;
				var value: string | boolean = true;
				var equals = cookie.indexOf('=');
				if (equals != -1) {
					key = cookie.slice(0, equals);
					value = cookie.slice(equals + 1);
				}
				this.cookies.set(key, value);
			});
		this.routeStack = [];
		if (this.get("Cache-Control") == 'no-cache')
			this.#stale = true;
		this.#stale = true;
		this.#fields = {};
		var url = new URL(req.url);
		this.originalUrl = url.toString();
		this.hostname = url.hostname;
	}

	get headers() { return this.#bunReq.headers }

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

	async text() {
		return await this.#bunReq.text();
	}

	async json() {
		return await this.#bunReq.json();
	}

	routeTrace() {
		return this.routeStack.map(r => r.path);
	}

	upgrade(serverToUpgradeOn: Server, handler: toastiebun.websocketHandler) {
		var websock = new websocket();
		serverToUpgradeOn.upgrade(this.#bunReq, {
			data: {
				ws: websock,
				req: this,
				handle: handler
			}
		});
		return websock;
	}
}
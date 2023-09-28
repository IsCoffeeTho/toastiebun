import server from "./server";
import { toastiebun } from "./toastiebun";

export default class request {
	#parent: server;
	#method: toastiebun.method;
	#text: () => Promise<string>;
	#json: () => Promise<any>;
	baseUrl: string;
	path: string;
	cookies: { [key: string]: (string | boolean) };
	constructor(parent: server, req: Request) {
		this.#parent = parent;
		this.baseUrl = req.url;
		this.path = new URL(req.url).pathname;
		this.#method = <toastiebun.method>req.method;
		this.#text = req.text;
		this.#json = req.json;
		this.cookies = {};
		var cookieHeader = req.headers.get("Cookie");
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
	}

	get app() {
		return this.#parent;
	}

	text() {
		return this.#text();
	}

	json() {
		return this.#json();
	}

	get method() {
		return this.#method;
	}
}
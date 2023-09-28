import { BunFile } from "bun";
import { existsSync } from "fs";
import request from "./request";
import response from "./response";
import { toastiebun } from "./toastiebun";

const thispkg = require("../package.json");

export default class server {
	#routes: toastiebun.handleDescriptor[];
	#running: boolean;
	host: string;
	port: number;
	constructor() {
		this.#routes = [];
		this.#running = false;
		this.host = "";
		this.port = 0;
	}
	use(path: toastiebun.path | toastiebun.path[] | server, middleware: server) {
		if (path instanceof server) {
			middleware = path;
			path = "*";
		}
		if (typeof path != "object") {
			path = [path];
		}
		path.sort((a, b) => { return b.length - a.length; })
		path.forEach((p) => { this.#addCatch("MIDDLEWARE", p ?? "*", middleware); })
		return this;
	}

	get(path: toastiebun.path, fn: toastiebun.handler) {
		this.#addCatch("GET", path, fn);
		return this;
	}

	post(path: toastiebun.path, fn: toastiebun.handler) {
		this.#addCatch("POST", path, fn);
		return this;
	}

	put(path: toastiebun.path, fn: toastiebun.handler) {
		this.#addCatch("PUT", path, fn);
		return this;
	}

	patch(path: toastiebun.path, fn: toastiebun.handler) {
		this.#addCatch("PATCH", path, fn);
		return this;
	}

	delete(path: toastiebun.path, fn: toastiebun.handler) {
		this.#addCatch("DELETE", path, fn);
		return this;
	}

	options(path: toastiebun.path, fn: toastiebun.handler) {
		this.#addCatch("OPTIONS", path, fn);
		return this;
	}

	head(path: toastiebun.path, fn: toastiebun.handler) {
		this.#addCatch("HEAD", path, fn);
		return this;
	}

	trace(path: toastiebun.path, fn: toastiebun.handler) {
		this.#addCatch("TRACE", path, fn);
		return this;
	}

	connect(path: toastiebun.path, fn: toastiebun.handler) {
		this.#addCatch("CONNECT", path, fn);
		return this;
	}

	all(path: toastiebun.path, fn: toastiebun.handler) {
		this.#addCatch("*", path, fn);
		return this;
	}

	#addCatch(method: toastiebun.method, path: toastiebun.path, fn: toastiebun.handler | server) {
		this.#routes.push({
			method: method,
			path: path,
			handle: fn
		});
	}

	#getRoutes(method: toastiebun.method, path: toastiebun.path) {
		return this.#routes.filter((route) => {
			if (route.method == "MIDDLEWARE")
				return (path.startsWith(route.path))
			if (route.method != "*" && route.method != method)
				return false;
			if (route.path.at(-1) == '*')
				return (path.startsWith(route.path.slice(0, -1)));
			return (route.path == path);
		});
	}

	// todo: figure out next() system
	trickleRequest(req: request, res: response, next: () => void) {
		var caughtOnce = false;
		var continueAfterCatch = false;
		var nextFn = () => {
			continueAfterCatch = true;
		};
		var methodRoutes = this.#getRoutes(<toastiebun.method>req.method, req.path);
		if (methodRoutes.length == 0)
			return false;
		for (var i = 0; i < methodRoutes.length; i++) {
			continueAfterCatch = false;
			caughtOnce = true;
			if (methodRoutes[i].handle instanceof server) {
				var savedPath = req.path;
				req.path = req.path.slice(methodRoutes[i].path.length);
				if (req.path.length == 0)
					req.path = "/";
				(<server>(<toastiebun.handleDescriptor>methodRoutes[i]).handle).trickleRequest(req, res, nextFn);
				req.path = savedPath;
			} else {
				(<toastiebun.handler>methodRoutes[i].handle)(req, res, nextFn);
			}
			if (!continueAfterCatch)
				break;
		}
		if (continueAfterCatch)
			next();
		return caughtOnce;
	}

	listen(host: string, port: number, fn: (server?: server) => any) {
		if (!this.#running) {
			this.#running = true;
			var parent = this;
			var s = Bun.serve({
				hostname: host,
				port: port,
				async fetch(req) {
					var url = new URL(req.url);
					var constructedRequest = new request(parent, req);
					var constructedResponse = new response(parent);
					try {
						parent.trickleRequest(constructedRequest, constructedResponse, () => { });
						if (constructedResponse.headerSent)
							return constructedResponse.asBunResponse;
						return new Response(`Cannot ${req.method} ${url.pathname}`, { status: 405, headers: { "Content-Type": "text/plain", "X-Powered-By": `ToastieBun v${thispkg.version}` } });
					} catch (err: any) {
						console.error(err);
						return new Response(`500 Internal Server Error\nUncaught ${err.name}: ${err.message}`, { status: 500, headers: { "Content-Type": "text/plain", "X-Powered-By": `ToastieBun v${thispkg.version}` } });
					}
				}
			});
			this.host = s.hostname;
			this.port = s.port;
			fn(this);
		}
	}
}
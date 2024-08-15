/// <reference path="toastiebun.d.ts" />

import { Server } from "bun";
import request from "./request";
import response from "./response";
import { toastiebun } from "./toastiebun.d";
import websocket from "./websocket";

// @ts-ignore // just imports version number
import thispkg from "../package.json";

export default class server implements toastiebun.server {
	#routes: toastiebun.handleDescriptor[];
	#running: boolean;
	#s: Server | null;
	host: string;
	port: number;
	#opts?: toastiebun.serverOptions;
	constructor(opt?: toastiebun.serverOptions) {
		this.#opts = opt;
		this.#routes = [];
		this.#running = false;
		this.#s = null;
		this.host = "";
		this.port = 0;
	}

	use(path: string | string[] | toastiebun.server, middleware?: toastiebun.server) {
		var pathArray = <string[]>[];

		if (path instanceof server) {
			middleware = <toastiebun.server>path;
			path = "/";
		} else if (!middleware || !(middleware satisfies toastiebun.server)) {
			throw new TypeError("Missing middleware for toastiebun.use(path?: string | string[], middleware: server)");
		}

		pathArray = (<string[]>path); // string | string[]
		if (typeof path == "string") {
			pathArray = [path];
		}
		pathArray.sort((a, b) => { return b.length - a.length; });
		pathArray.forEach((p, i) => {
			if (!toastiebun.pathPatternLike.test(p))
				throw new TypeError(`path[${i}] is not toastiebun.URILike`);
			this.#addCatch("MIDDLEWARE", p ?? "/", <toastiebun.server>middleware);
		})
		return this;
	}

	all(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("*", path, fn); return this; }
	get(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("GET", path, fn); return this; }
	put(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("PUT", path, fn); return this; }
	post(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("POST", path, fn); return this; }
	head(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("HEAD", path, fn); return this; }
	trace(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("TRACE", path, fn); return this; }
	patch(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("PATCH", path, fn); return this; }
	delete(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("DELETE", path, fn); return this; }
	websocket(path: string, fn: toastiebun.websocketHandler) { this.#addCatch("WS", path, fn); return this; }
	options(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("OPTIONS", path, fn); return this; }
	connect(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("CONNECT", path, fn); return this; }
	#addCatch(method: toastiebun.method, path: toastiebun.pathPattern, fn: toastiebun.handlerFunction | toastiebun.server | toastiebun.websocketHandler) {
		if (!toastiebun.pathPatternLike.test(path))
			throw new TypeError("path is not toastiebun.pathPatern");
		this.#routes.push({
			method: method,
			path: path,
			handler: fn
		});
	}

	#getRoutes(method: toastiebun.method, path: string) {
		return this.#routes.filter((route) => {
			if (route.method == "MIDDLEWARE")
				return (path == route.path || path.startsWith(route.path.at(-1) != '/' ? `${route.path}/` : route.path));
			if (route.method != "*" && route.method != method)
				return false;
			if (route.path.at(-1) == '*')
				return (path.startsWith(route.path.slice(0, -1)));
			if (method == "WS" && route.method != "GET")
				return false;
			if (route.path.indexOf(":") != -1) {
				var master = route.path.split("/");
				var candidate = path.split("/");
				if (master.length != candidate.length)
					return false;
				for (var idx in master) {
					var key = master[idx];
					if (key.startsWith(":"))
						continue;
					if (key != candidate[idx])
						return false;
				}
				return true;
			}
			return (route.path == path);
		});
	}

	trickleRequest(req: toastiebun.request, res: toastiebun.response, next: toastiebun.nextFn) {
		var caughtOnce = false;
		var continueAfterCatch = false;
		var nextFn: toastiebun.nextFn = () => { continueAfterCatch = true; };
		var methodRoutes = this.#getRoutes(<toastiebun.method>req.method, req.path);
		if (methodRoutes.length == 0)
			return false;
		for (var i = 0; i < methodRoutes.length; i++) {
			if (methodRoutes[i].path.indexOf(":") != -1) {
				var master = methodRoutes[i].path.split("/");
				var candidate = req.path.split("/");
				if (master.length != candidate.length)
					return false;
				for (var idx in master) {
					var key = master[idx];
					if (!key.startsWith(":"))
						continue;
					req.params[key.slice(1)] = candidate[idx];
				}
			}
			req.routeStack.push(methodRoutes[i]);
			continueAfterCatch = false;
			caughtOnce = true;
			if (req.headers.has("Upgrade")) {
				if (methodRoutes[i].method != "WS")
					continue;
				req.upgrade(<Server>this.#s, <toastiebun.websocketHandler>methodRoutes[i].handler);
			} else if (methodRoutes[i].handler instanceof server) {
				var savedPath = req.path;
				req.path = req.path.slice(methodRoutes[i].path.length);
				if (!req.path.startsWith('/'))
					req.path = '/' + req.path;
				(<server><unknown>methodRoutes[i].handler).trickleRequest(req, res, nextFn);
				req.path = savedPath;
			} else {
				(<toastiebun.handlerFunction>methodRoutes[i].handler)(req, res, nextFn);
			}
			if (!continueAfterCatch)
				break;
		}
		if (continueAfterCatch)
			next();
		return caughtOnce;
	}

	listen(host: string, port: number, fn?: (server: toastiebun.server) => any) {
		if (!this.#running) {
			this.#running = true;
			var parent = this;
			var tls = this.#opts?.tls ?? {};

			// default favicon
			if (this.#getRoutes("GET", "/favicon.ico").length > 0) {
				this.#routes.unshift({
					method: "GET",
					path: "/favicon.ico",
					handler: (req, res) => {
						res.sendFile(`${__dirname}/../assets/toastiebun.ico`);
					}
				});
			}

			this.#s = Bun.serve({
				tls,
				hostname: host,
				port: port,
				async fetch(req) {
					var url = new URL(req.url);
					var constructedResponse = new response(parent, req);
					var constructedRequest = new request(parent, req, constructedResponse);
					try {
						parent.trickleRequest(constructedRequest, constructedResponse, () => { });
						if (constructedResponse.headerSent)
							return constructedResponse.asBunResponse;
						return new Response(`Cannot ${req.method} ${url.pathname}`, { status: 405, headers: { "Content-Type": "text/plain", "X-Powered-By": `ToastieBun v${thispkg.version}` } });
					} catch (err: any) {
						console.error(err);
						return new Response(`500 Internal Server Error\nUncaught ${err.name}: ${err.message}`, { status: 500, headers: { "Content-Type": "text/plain", "X-Powered-By": `ToastieBun v${thispkg.version}` } });
					}
				},
				websocket: {
					message(ws, data) {
						try {
							(<{ ws: websocket }>ws.data).ws.emit("data", data);
						}
						catch (err) {
							(<{ ws: websocket }>ws.data).ws.emit("error", err);
						}
					},
					open(ws) {
						(<{ handle: toastiebun.websocketHandler }>ws.data).handle((<{ ws: websocket }>ws.data).ws);
					},
					close(ws, code, reason) {
						try {
							(<{ ws: websocket }>ws.data).ws.emit("close", code, reason);
						}
						catch (err) {
							(<{ ws: websocket }>ws.data).ws.emit("error", err);
						}
					}
				}
			});
			this.host = this.#s.hostname;
			this.port = this.#s.port;
			if (fn)
				fn(this);
			return true;
		}
		return false;
	}
}
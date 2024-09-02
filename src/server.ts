/// <reference path="toastiebun.d.ts" />

import { Server, ServerWebSocket } from "bun";
import request from "./request";
import response from "./response";
import { toastiebun } from "./toastiebun.d";
import websocket from "./websocket";

// @ts-ignore // just imports version number
import thispkg from "../package.json";


export default class server {
	#routes: toastiebun.handleDescriptor[] = [];
	#running: boolean = false;
	#s: Server | null = null;
	/** Hostname of the server, once bound */
	host: string = "";
	/** Port of the server, once bound */
	port: number = 0;
	#opts?: toastiebun.serverOptions;
	/** 
	 * @example
	 * const app = new toastiebun.server()
	 * 
	 * app.get("/", (req, res) => {
	 * 	res.send("Hello World!");
	 * })
	 * 
	 * app.listen("::1", 3000, () => {
	 * 	console.log("http://[::1]:3000");
	 * })
	 */
	constructor(opt?: toastiebun.serverOptions) {
		this.#opts = opt;
	}

	/** Hooks middleware on server. */
	use(middleware: server): this;
	/** Hooks middleware on path. */
	use(path: string | string[], middleware: server): this;

	/** Implements a middleware server for requests. */
	use(path: string | string[] | server, middleware?: server) {
		var pathArray = <string[]>[];

		if (path instanceof server) {
			middleware = <server>path;
			path = "/";
		} else if (!middleware || !(middleware satisfies server)) {
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
			this.#addCatch("MIDDLEWARE", p ?? "/", <server>middleware);
		})
		return this;
	}

	
	all(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("*", path, fn); return this; }
	get(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("GET", path, fn); return this; }
	put(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("PUT", path, fn); return this; }
	post(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("POST", path, fn); return this; }
	patch(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("PATCH", path, fn); return this; }
	delete(path: string, fn: toastiebun.handlerFunction) { this.#addCatch("DELETE", path, fn); return this; }
	websocket(path: string, fn: toastiebun.websocketHandler) { this.#addCatch("WS", path, fn); return this; }
	#addCatch(method: toastiebun.catchMethod, path: string, fn: toastiebun.handlerFunction | server | toastiebun.websocketHandler) {
		if (!toastiebun.pathPatternLike.test(path))
			throw new TypeError("path is not toastiebun.pathPatern");
		this.#routes.push({
			method: method,
			path: path,
			handler: fn
		});
	}

	#getRoutes(method: toastiebun.catchMethod, path: string) {
		return this.#routes.filter((route) => {
			if (route.method == "MIDDLEWARE")
				return (path == route.path || path.startsWith(route.path.at(-1) != '/' ? `${route.path}/` : route.path));
			if (route.method == "WS") {
				if (method != "GET")
					return false;
			} else if (route.method != "*" && route.method != method)
				return false;
			if (route.path.at(-1) == '*')
				return (path.startsWith(route.path.slice(0, -1)));
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

	/** @ignore */
	async trickleRequest(req: request, res: response, next: toastiebun.nextFn) {
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
			if (req.headers.has("Upgrade")) {
				if (methodRoutes[i].method != "WS")
					continue;
				caughtOnce = true;
				req.upgrade(<Server>this.#s, <toastiebun.websocketHandler>methodRoutes[i].handler);
			} else if (methodRoutes[i].handler instanceof server) {
				var savedPath = req.path;
				req.path = req.path.slice(methodRoutes[i].path.length);
				if (!req.path.startsWith('/'))
					req.path = '/' + req.path;
				if (await (<server><unknown>methodRoutes[i].handler).trickleRequest(req, res, nextFn))
					caughtOnce = true;
				else
					continueAfterCatch = true;
				req.path = savedPath;
			} else {
				caughtOnce = true;
				await (<toastiebun.handlerFunction>methodRoutes[i].handler)(req, res, nextFn);
			}
			if (!continueAfterCatch)
				break;
		}
		if (continueAfterCatch)
			next();
		return caughtOnce;
	}

	/** Hooks server to an Address and Port
	 * 
	 * @see {@link server.constructor}
	*/
	listen(host: string, port: number, callback?: (server: server) => any) {
		if (this.#running)
			return false;
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
					await parent.trickleRequest(constructedRequest, constructedResponse, () => { });
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
					var tws = (<{ ws: websocket }>ws.data).ws;
					try {
						tws.emit("data", data);
					}
					catch (err) {
						if (!tws.emit("error", err))
							throw err;
					}
				},
				open(ws) {
					var handle = (<{ handle: toastiebun.websocketHandler }>ws.data).handle;
					var tws = (<{ ws: websocket }>ws.data).ws;
					tws.baseWS = <ServerWebSocket<unknown>>ws;
					handle(tws);
				},
				close(ws, code, reason) {
					var tws = (<{ ws: websocket }>ws.data).ws;
					try {
						tws.emit("close", code, reason);
					}
					catch (err) {
						if (!tws.emit("error", err))
							throw err;
					}
				}
			}
		});
		this.host = this.#s.hostname;
		this.port = this.#s.port;
		if (callback)
			callback(this);
		return true;
	}
}
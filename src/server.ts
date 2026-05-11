import { toastiebun } from "./toastiebun.ts";
import { BunFile, Server, ServerWebSocket } from "bun";
import request from "./request";
import response from "./response";
import websocket from "./websocket";

// @ts-ignore // just imports version number
import thispkg from "../package.json";
import { cookieOptions, CORSOptions, method, pathPatternLike, ToastiebunError } from "./utils";

type catchMethod = method | "*" | "MIDDLEWARE" | "WS";
type nextFn = () => any;

type handleDescriptor = toastiebun.route & {
	handler?: toastiebun.handlerFunction | server | toastiebun.websocketHandler;
	options?: CORSOptions | null;
};

type serverOptions = {
	tls?: {
		key: BunFile;
		cert: BunFile;
	};
	cors?: CORSOptions;
	defaultCookieOptions?: cookieOptions;
};

export default class server {
	#routes: handleDescriptor[] = [];
	#errorHandler?: toastiebun.errorHandlerFunction;
	#running: boolean = false;
	#s: Server<any> | null = null;
	/** Hostname of the server, once bound */
	host: string = "";
	/** Port of the server, once bound */
	port: number = 0;
	#opts?: serverOptions;
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
	constructor(opt?: serverOptions) {
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
			throw new TypeError("Missing middleware for use(path?: string | string[], middleware: server)");
		}

		pathArray = <string[]>path; // string | string[]
		if (typeof path == "string") {
			pathArray = [path];
		}
		pathArray.sort((a, b) => {
			return b.length - a.length;
		});
		pathArray.forEach((p, i) => {
			if (!pathPatternLike.test(p)) throw new TypeError(`path[${i}] is not URILike`);
			this.#addCatch(<toastiebun.method>"MIDDLEWARE", p ?? "/", <server>middleware);
		});
		return this;
	}

	all(path: string, fn: toastiebun.handlerFunction) {
		this.#addCatch(<toastiebun.method>"*", path, fn);
		return this;
	}
	get(path: string, fn: toastiebun.handlerFunction) {
		this.#addCatch("GET", path, fn);
		return this;
	}
	put(path: string, fn: toastiebun.handlerFunction) {
		this.#addCatch("PUT", path, fn);
		return this;
	}
	post(path: string, fn: toastiebun.handlerFunction) {
		this.#addCatch("POST", path, fn);
		return this;
	}
	patch(path: string, fn: toastiebun.handlerFunction) {
		this.#addCatch("PATCH", path, fn);
		return this;
	}
	delete(path: string, fn: toastiebun.handlerFunction) {
		this.#addCatch("DELETE", path, fn);
		return this;
	}
	websocket(path: string, fn: toastiebun.websocketHandler) {
		this.#addCatch(<toastiebun.method>"WS", path, fn);
		return this;
	}
	#addCatch(method: toastiebun.method, path: string, fn: toastiebun.handlerFunction | server | toastiebun.websocketHandler) {
		if (!pathPatternLike.test(path)) throw new TypeError("path is not pathPatern");
		this.#routes.push({
			method,
			path,
			handler: fn,
		});
	}
	options(path: string, options: CORSOptions | null) {
		if (!pathPatternLike.test(path)) throw new TypeError("path is not pathPatern");
		this.#routes.push({
			method: "OPTIONS",
			path,
			options,
		});
		return this;
	}

	error(fn: toastiebun.errorHandlerFunction) {
		this.#errorHandler = fn;
		return this;
	}

	#getRoutes(method: catchMethod, path: string) {
		const METHOD_CHECK = (route: handleDescriptor) => {
			if (route.method == "OPTIONS" || method == "OPTIONS") return route.path != "*";
			if (<string>route.method == "WS") return method == "GET";
			if (<string>route.method == "*") return true;
			return route.method == method;
		};
		return this.#routes.filter(route => {
			if (<string>route.method == "MIDDLEWARE") return path == route.path || path.startsWith(route.path.at(-1) != "/" ? `${route.path}/` : route.path);
			if (!METHOD_CHECK(route)) return false;
			if (route.path.at(-1) == "*") return path.startsWith(route.path.slice(0, -1));
			if (route.path.indexOf(":") != -1) {
				var master = route.path.split("/");
				var candidate = path.split("/");
				if (master.length != candidate.length) return false;
				for (var idx in master) {
					var key = master[idx];
					if (key.startsWith(":")) continue;
					if (key != candidate[idx]) return false;
				}
				return true;
			}
			return route.path == path;
		});
	}

	/** @ignore */
	async trickleRequest(req: request, res: response, next: nextFn) {
		var caughtOnce = false;
		var continueAfterCatch = false;
		var nextFn: nextFn = () => {
			continueAfterCatch = true;
		};
		var methodRoutes = this.#getRoutes(<method>req.method, req.path);
		if (methodRoutes.length == 0) return false;
		if (this.#opts?.cors) res.options = this.#opts?.cors;
		for (var i = 0; i < methodRoutes.length; i++) {
			let route = <handleDescriptor>methodRoutes[i];
			if (route.path.indexOf(":") != -1) {
				var master = route.path.split("/");
				var candidate = req.path.split("/");
				if (master.length != candidate.length) return false;
				for (var idx in master) {
					var key = master[idx];
					if (!key.startsWith(":")) continue;
					req.params[key.slice(1)] = candidate[idx];
				}
			}
			req.routeStack.push(route);
			continueAfterCatch = false;
			if (route.handler instanceof server) {
				var savedPath = req.path;
				req.path = req.path.slice(route.path.length);
				if (!req.path.startsWith("/")) req.path = "/" + req.path;
				if (await (<server>(<unknown>route.handler)).trickleRequest(req, res, nextFn)) caughtOnce = true;
				else continueAfterCatch = true;
				if (caughtOnce && (<server>(<unknown>route.handler)).#opts) res.options = <CORSOptions>(<server>(<unknown>route.handler)).#opts?.cors;
				req.path = savedPath;
			} else if (route.method == "OPTIONS") {
				res.options = <CORSOptions>route.options;
				if (req.method == "OPTIONS") {
					if (!res.headerSent)
						res.send("");
				} else continueAfterCatch = true;
			} else if (req.method == "OPTIONS") {
				if (!res.options)
					res.options = {};
				if (!res.options?.methods)
					res.options.methods = [];
				let caughtMethod = route.method;
				if (<string>caughtMethod == "WS")
					caughtMethod = "GET";
				res.options.methods.push(caughtMethod);
				if (!res.headerSent)
					res.send("");
				continueAfterCatch = true;
			} else if (route.method == <toastiebun.method>"WS") {
				if (!req.headers.has("Upgrade")) continue;
				caughtOnce = true;
				req.upgrade(<Server<any>>(<unknown>this.#s), <toastiebun.websocketHandler>route.handler);
			} else {
				caughtOnce = true;
				await (<toastiebun.handlerFunction>route.handler)(req, res, nextFn);
			}
			if (!continueAfterCatch) break;
		}
		if (continueAfterCatch) next();
		return caughtOnce;
	}

	/** Hooks server to an Address and Port
	 *
	 * @see {@link server.constructor}
	 */
	listen(host: string, port: number, callback?: (server: server) => any) {
		if (this.#running) return false;
		this.#running = true;
		var parent = this;
		var tls = this.#opts?.tls ?? {};
		var defaultCookieOptions = this.#opts?.defaultCookieOptions ?? {};

		// default favicon
		if (this.#getRoutes("GET", "/favicon.ico").length > 0) {
			this.#routes.unshift({
				method: "GET",
				path: "/favicon.ico",
				handler: (req, res) => {
					res.sendFile(`${__dirname}/../assets/toastiebun.ico`);
				},
			});
		}

		const errorHandler: toastiebun.errorHandlerFunction =
			this.#errorHandler ??
			((_req, res, err) => {
				var status = 500;
				var message = `500 Internal Server Error\nUncaught ${err.name}: ${err.message}`;
				if (err instanceof ToastiebunError) {
					status = err.status;
					message = err.message;
				}
				res.status(status).send(message);
			});

		this.#s = Bun.serve({
			tls,
			hostname: host,
			port: port,
			async fetch(this, req) {
				var url = new URL(req.url);
				var constructedResponse = new response(parent, req, defaultCookieOptions);
				var constructedRequest = new request(parent, req, constructedResponse, this.requestIP(req)?.address ?? "");
				try {
					await parent.trickleRequest(constructedRequest, constructedResponse, () => {});
					if (constructedResponse.headerSent) return constructedResponse.asBunResponse;
					throw new ToastiebunError(405, `Cannot ${req.method} ${url}`);
				} catch (err: any) {
					errorHandler(constructedRequest, constructedResponse, err);
					if (constructedResponse.headerSent) return constructedResponse.asBunResponse;
					return new Response(`500 Internal Server Error\nUncaught ${err.name}: ${err.message}`, {
						status: 500,
						headers: { "Content-Type": "text/plain", "X-Powered-By": `ToastieBun v${thispkg.version}` },
					});
				}
			},
			websocket: {
				message(ws, data) {
					var tws = (<{ ws: websocket }>(<unknown>ws.data)).ws;
					try {
						if (typeof data == "string") data = Buffer.from(data);
						tws.emit("data", data);
					} catch (err: any) {
						if (!tws.emit("error", err)) throw err;
					}
				},
				open(ws) {
					var handle = (<{ handle: toastiebun.websocketHandler }>(<unknown>ws.data)).handle;
					var tws = (<{ ws: websocket }>(<unknown>ws.data)).ws;
					tws.baseWS = <ServerWebSocket<unknown>>ws;
					handle(tws);
				},
				close(ws, code, reason) {
					var tws = (<{ ws: websocket }>(<unknown>ws.data)).ws;
					try {
						tws.emit("close", code, reason);
					} catch (err: any) {
						if (!tws.emit("error", err)) throw err;
					}
				},
			},
		});
		this.host = <string>this.#s.hostname;
		this.port = <number>this.#s.port;
		if (callback) callback(this);
		return true;
	}
}

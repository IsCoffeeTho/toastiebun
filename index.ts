import { BunFile } from "bun";

const thispkg = require("./package.json");

type path = string;
type method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "TRACE" | "CONNECT" | "*" | "MIDDLEWARE";
type handler = (req: request, res: response, next?: handler) => void;

type handleDescriptor = {
	method: method,
	path: path,
	handler: handler | server
};

type httpFrame = {
	status: number,
	headers: {
		[key: string]: string
	},
	body: any;
};

class request {
	#parent: server;
	#method: method;
	#text: () => Promise<string>;
	#json: () => Promise<any>;
	baseUrl: string;
	path: string;
	cookies: { [key: string]: (string | boolean) };
	constructor(parent: server, req: Request) {
		this.#parent = parent;
		this.baseUrl = req.url;
		this.path = new URL(req.url).pathname;
		this.#method = <method>req.method;
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

export class response {
	#httpframe: httpFrame;
	#sentHeaders: boolean = false;
	#parent: server;
	constructor(parent: server) {
		this.#parent = parent;
		this.#httpframe = {
			status: 200,
			headers: {},
			body: null
		};
	}

	status(code: number) {
		this.#httpframe.status = code;
		return this;
	}

	send(body: any) {
		if (this.#httpframe.body satisfies BunFile) {
			this.#httpframe.body = body;
			this.#httpframe.headers["Content-Type"] = (<BunFile>body).type;
		} else if (Buffer.isBuffer(body)) {
			this.#httpframe.body = body.toString();
		} else
			switch (typeof body) {
				case "object":
					this.#httpframe.body = JSON.stringify(body);
					this.#httpframe.headers["Content-Type"] = "application/json";
					break;
				default:
					this.#httpframe.body = `${body}`;
					break;
			}
		this.#sentHeaders = true;
	}

	sendFile(path: string, errorCallback?: (err?: any) => any) {
		var body = Bun.file(path);
		if (body.type == "application/octet-stream") {
			var err = new Error("ENOENT");
			if (errorCallback)
				errorCallback(err);
			else
				throw err;
			return;
		}
		this.#httpframe.body = body;
		this.#httpframe.headers["Content-Type"] = body.type;
		this.#sentHeaders = true;
	}

	get asBunResponse() {
		if (this.#httpframe.body satisfies BunFile && (<BunFile>this.#httpframe.body).type == "application/octet-stream")
			throw new Error("ENOENT");
		return new Response(this.#httpframe.body, {
			status: this.#httpframe.status,
			headers: {
				...this.#httpframe.headers,
				"X-Powered-By": `ToastieBun v${thispkg.version}`
			}
		});
	}

	get headerSent() {
		return this.#sentHeaders;
	}

	get app() {
		return this.#parent;
	}
}

export class server {
	#routes: handleDescriptor[];
	#running: boolean;
	host: string;
	port: number;
	constructor() {
		this.#routes = [];
		this.#running = false;
		this.host = "";
		this.port = 0;
	}
	use(path: path | path[] | server, middleware: server) {
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

	get(path: path, fn: handler) {
		this.#addCatch("GET", path, fn);
		return this;
	}

	post(path: path, fn: handler) {
		this.#addCatch("POST", path, fn);
		return this;
	}

	put(path: path, fn: handler) {
		this.#addCatch("PUT", path, fn);
		return this;
	}

	patch(path: path, fn: handler) {
		this.#addCatch("PATCH", path, fn);
		return this;
	}

	delete(path: path, fn: handler) {
		this.#addCatch("DELETE", path, fn);
		return this;
	}

	options(path: path, fn: handler) {
		this.#addCatch("OPTIONS", path, fn);
		return this;
	}

	head(path: path, fn: handler) {
		this.#addCatch("HEAD", path, fn);
		return this;
	}

	trace(path: path, fn: handler) {
		this.#addCatch("TRACE", path, fn);
		return this;
	}

	connect(path: path, fn: handler) {
		this.#addCatch("CONNECT", path, fn);
		return this;
	}

	all(path: path, fn: handler) {
		this.#addCatch("*", path, fn);
		return this;
	}

	#addCatch(method: method, path: path, fn: handler | server) {
		this.#routes.push({
			method: method,
			path: path,
			handler: fn
		});
	}

	#getRoutes(method: method, path: path) {
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
		var methodRoutes = this.#getRoutes(<method>req.method, req.path);
		if (methodRoutes.length == 0)
			return false;
		for (var i = 0; i < methodRoutes.length; i++) {
			continueAfterCatch = false;
			caughtOnce = true;
			if (methodRoutes[i].handler instanceof server) {
				var savedPath = req.path;
				req.path = req.path.slice(methodRoutes[i].path.length);
				if (req.path.length == 0)
					req.path = "/";
				(<server>methodRoutes[i].handler).trickleRequest(req, res, nextFn);
				req.path = savedPath;
			} else {
				(<handler>methodRoutes[i].handler)(req, res, nextFn);
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

export default {
	server,
	request,
	response
};
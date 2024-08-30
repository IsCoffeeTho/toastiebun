import { Server } from "bun";
import { toastiebun } from "./toastiebun";
import websocket from "./websocket";
import response from "./response";
import server from "./server";

/**
 * @hideconstructor
 */
export default class request {
	#parent: server;
	#method: toastiebun.method;
	#stale: boolean;
	#fields: { [field: string]: string };
	#bunReq: Request;
	
	/**
	 * If the server has decided to delegate handling of a path to a middleware,
	 * the parent path that caused the handle to capture will be available here.
	 * 
	 * @see {@link server.use}
	 */
	baseUrl: string;

	/**
	 * Provides the current path of the request.
	 * 
	 * @see {@link server.use}
	 */
	path: string;

	/**
	 * @TODO write info
	 */
	cookies: Map<string, string | boolean>;

	/**
	 * Represents a list of all the routes that "caught" the request before this handler.
	 */
	routeStack: toastiebun.route[];
	
	/**
	 * The linked Response of the request.
	 * @ignore
	 */
	readonly res: response;

	/**
	 * Search parameters of the request (if any)
	 * 
	 * @example
	 * '/users/:id' -> '/users/a0b1c2d3e4f5g6h7i8j9'
	 * // would result in a 'params' with:
	 * `{"id":"a0b1c2d3e4f5g6h7i8j9"}`
	 */
	readonly params: { [key: string]: string; };

	/**
	 * Search query of the request (if any)
	 * 
	 * @example
	 * // example.ts
	 * 
	 * // GET /users/search?name=john 
	 * .get("/users/search", (req, res) => {
	 * 	console.log(req.query.get("name")); // "john"
	 * })
	 * 
	 */
	readonly query: URLSearchParams;

	/**
	 * @TODO write info
	 */
	originalUrl: string;

	/**
	 * Provided hostname of the request. Not garunteed to be accurate, but is provided using the
	 * `Host` header in the HTTP request
	 */
	hostname: string;

	/**
	 * Request persistent data for developers to manipulate and keep track of.
	 */
	data: any;
	constructor(parent: server, req: Request, res: response) {
		this.#parent = parent;
		this.#bunReq = req;
		this.baseUrl = this.#bunReq.url;
		const urlobj = new URL(this.#bunReq.url)
		this.path = urlobj.pathname;
		this.#method = <toastiebun.method>this.#bunReq.method;
		this.params = {}; /** @TODO implement */
		this.query = urlobj.searchParams;
		this.res = res;
		this.cookies = new Map<string, string | boolean>();
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
				this.cookies.set(key, value);
			});
		this.routeStack = [];
		this.#stale = false;
		if (this.headers.get("Cache-Control") == 'no-cache')
			this.#stale = true;
		this.#fields = {};
		var url = new URL(req.url);
		this.originalUrl = url.toString();
		this.hostname = url.hostname;
	}

	/**
	 * HTTP Headers of the request.
	 * {@link https://datatracker.ietf.org/doc/html/rfc2616#autoid-33}
	 */
	get headers() { return this.#bunReq.headers }

	/**
	 * HTTP Method of the request.
	 */
	get method() { return this.#method; }

	/**
	 * Internet Protocal Address of the request.
	 * 
	 */
	get ip() { return this.#bunReq.destination; }

	/**
	 * Represents the toastiebun {@link server} that is serving the request.
	 * @see {@link server}
	 */
	get app() { return this.#parent; }

	/**
	 * Represents whether the clients cache should or shouldn't be updated
	 * 
	 * If `true`, the client is indicating that it may have the content requested in its cache
	 * 
	 * When a client sends the Cache-Control: no-cache request header to indicate an end-
	 * to-end reload request. Further details for how cache validation works can be found in
	 * the HTTP/1.1 Caching Specification {@link https://tools.ietf.org/html/rfc7234}.
	 * @see {@link stale}
	 */
	get fresh() { return !this.#stale; }

	/**
	 * Represents whether the clients cache should or shouldn't be updated
	 * 
	 * If `true`, the client is indicating that it may have content in its cache that is out of date
	 * 
	 * When a client sends the Cache-Control: no-cache request header to indicate an end-
	 * to-end reload request. Further details for how cache validation works can be found in
	 * the HTTP/1.1 Caching Specification {@link https://tools.ietf.org/html/rfc7234}.
	 * @see {@link fresh}
	 */
	get stale() { return this.#stale; }

	/**
	 * Returns text as a promise.
	 * 
	 * @example
	 * const body = await req.text()
	 * console.log(body);
	 */
	async text() {
		return await this.#bunReq.text();
	}

	/**
	 * Returns json as a promise
	 * 
	 * @example
	 * const body = await req.json()
	 * console.log(json);
	 */
	async json() {
		return await this.#bunReq.json();
	}

	/**
	 * @TODO write info
	 */
	routeTrace() {
		return this.routeStack.map(r => r.path);
	}

	/**
	 * @internal
	 * @ignore
	 */
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
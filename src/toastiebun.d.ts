import { BunFile, Server } from "bun";
import { Socket } from "net";
import { Headers } from "fetch";

export namespace toastiebun {

	/**
	 * Regular expression pattern to match strings resembling file paths.
	 *
	 * This regex pattern can be used to identify and validate strings that resemble
	 * file paths, including characters commonly found in paths such as letters,
	 * numbers, '/', '+', '-', '_', '.', and URL-encoded characters like `%20`.
	 *
	 * @internal
	 * @type {RegExp}
	 * @see {@link path}
	 */
	export const pathLike: RegExp = /^([a-zA-Z0-9]|[\/+-_.]|\%[0-9a-fA-F][0-9a-fA-F])+$/;
	/**
	 * Strings resembling file paths.
	 *
	 * This type can be used to identify file paths, including characters
	 * commonly found in paths such as letters, numbers, '/', '+', '-', '_',
	 * '.', and URL-encoded characters like `%20`.
	 * @see {@link pathLike}
	 */
	export type path = string;

	/**
	 *	@see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes}
	 */
	export const cookieNameLike = /[_!#$%'*+.^`|~a-zA-Z0-9\-]/g;

	/**
	 * Regular expression pattern to match HTTP request paths, with optional wildcard support.
	 *
	 * This regex pattern is designed to identify and validate strings that resemble
	 * paths used in HTTP requests. It includes characters commonly found in HTTP paths
	 * such as letters, numbers, '/', '+', '-', '_', '.', URL-encoded characters like '%20',
	 * and the '*' character, which serves as an optional wildcard to match the ends of strings.
	 *
	 * @type {RegExp}
	 */
	export const pathPatternLike: RegExp = /^(([a-zA-Z0-9]|[\/+-_.]|\%[0-9a-fA-F][0-9a-fA-F])+\*{0,1}|\*)$/;

	/**
	 * HTTP request paths, with optional wildcard support.
	 *
	 * This type is designed to identify paths used in HTTP requests. It includes characters
	 * commonly found in HTTP paths such as letters, numbers, '/', '+', '-', '_', '.',
	 * URL-encoded characters like '%20', and the '*' character, which serves as an optional
	 * wildcard to match the ends of strings.
	 */
	export type pathPattern = string;

	/**
	 * Represents HTTP methods commonly used in web development, including a catch all `"*"` and a `"MIDDLEWARE"` indicator
	 * to express special handling
	 * 
	 * The `method` type represents standard HTTP methods as strings, such as:
	 * - `"GET"`: The HTTP GET method retrieves data from the specified resource.
	 * - `"POST"`: The HTTP POST method submits data to be processed to a specified resource.
	 * - `"PUT"`: The HTTP PUT method updates a resource or creates one if it doesn't exist.
	 * - `"DELETE"`: The HTTP DELETE method deletes a specified resource.
	 * - `"PATCH"`: The HTTP PATCH method applies partial modifications to a resource.
	 * - `"HEAD"`: The HTTP HEAD method retrieves headers of a specified resource without the body.
	 * - `"OPTIONS"`: The HTTP OPTIONS method retrieves information about the communication options.
	 * 
	 * ***as well as***
	 * - `"*"`: Represents a wildcard that encompasses all HTTP methods.
	 * - `"MIDDLEWARE"`: Represents a custom value for middleware handling, where a request is sent
	 * to a sub-handler to modify or decorate it as it's being processed.
	 * @internal
	 */
	export type method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "TRACE" | "CONNECT" | "*" | "MIDDLEWARE" | "WS";

	/**
	 * @template TBM - Marked **T**o **B**e **M**odified
	 * 
	 * @param {any} ctx - unused
	 */
	export type nextFn = (ctx?: any) => any;

	/**
	 * HTTP Handler Function
	 *
	 * A handler function that modifies requests and responses as HTTP requests come in.
	 * Handler functions have access to the request `req`, response `res`, and can call
	 * the next handler in the stack `next()`.
	 *
	 * @param {request} req - The HTTP request object.
	 * @param {response} res - The HTTP response object to modify.
	 * @param {function} next - The callback function to call the next Handler (if any).
	 * @returns {any}
	 */
	export type handlerFunction = (req: request, res: response, next: nextFn) => any;

	/**
	 * WebSocket Handler Function
	 * 
	 * A handler function that creates and supplies a websocket to hook on for ws requests.
	 * 
	 * @param {toastiebun.websocket} ws - The Websocket to hook.
	 * @returns {void}
	 */
	export type websocketHandler = (ws: websocket) => void;

	/**
	 * HTTP Handler Catch Descriptor
	 * 
	 * A handler descriptor is used to describe a path and a {@link handlerFunction}
	 * 
	 * @see {@link handlerFunction} 
	 */
	export type catchDescriptor<T> = (path: pathPattern, handler: handlerFunction) => T;

	/**
	 * @see {@link catchDescriptor}
	 * @see {@link server}
	 * @internal
	 */
	export type handleDescriptor = {
		path: pathPattern,
		method: method,
		handler: handlerFunction | server | websocketHandler
	};

	/**
	 * @template TBM - Marked **T**o **B**e **M**odified
	 * @internal
	 */
	export type httpFrame = {
		status: number,
		headers: {
			[key: string]: string
		},
		body: any;
	}

	/**
	 * @template TBM - Marked **T**o **B**e **M**odified
	 * @internal
	 */
	export type httpStatus = 100 | 101 | 102 | 103 |
		200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 |
		300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308 |
		400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 |
		410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 |
		422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451 |
		500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 |
		511;

	/**
	 * @template TBM - Marked **T**o **B**e **M**odified
	 * @internal
	 */
	export type httpBody = any;

	/**
	 * @template TBM - Marked **T**o **B**e **M**odified
	 */
	export type serverOptions = {
		tls?: {
			key: BunFile,
			cert: BunFile
		}
	};

	/**
	 * 
	 * @see {@link toastiebun.serverOptions}
	 * @example
	 * const app = new toastiebun.server({
	 * })
	 */
	export interface server {
		host: string,
		port: number,
		get: catchDescriptor<this>;
		post: catchDescriptor<this>;
		put: catchDescriptor<this>;
		patch: catchDescriptor<this>;
		delete: catchDescriptor<this>;
		options: catchDescriptor<this>;
		trace: catchDescriptor<this>;
		connect: catchDescriptor<this>;
		all: catchDescriptor<this>;
		websocket: (path: pathPattern, websocketFunction: (ws: websocket) => any) => this;
		use: (path: pathPattern | pathPattern[] | server, middleware?: server) => this;
		trickleRequest: (req: request, res: response, next: nextFn) => Promise<boolean>;
		listen: (host: string, port: number, fn?: (server: server) => any) => boolean;
	}

	/**
	 * 
	 * 
	 */
	export interface request {

		/**
		 * Represents the toastiebun {@link server} that is serving the request.
		 * @see {@link server}
		 */
		readonly app: server;

		/**
		 * If the server has decided to delegate handling of a path to a middleware,
		 * the parent path that caused the handle to capture will be available here.
		 * 
		 * @see {@link server.use}
		 */
		readonly baseUrl: toastiebun.path;

		/**
		 * Holds the previous request handlers that has modified or handled the current
		 * request prioir.
		 * 
		 * @see {@link server.all}
		 * @see {@link server.use}
		 */
		readonly routeStack: toastiebun.handleDescriptor[];

		/**
		 * Magic Cookies that are sent with the client.
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie}
		 * @see {@link https://en.wikipedia.org/wiki/Magic_cookie}
		 */
		readonly cookies: Map<string, string | boolean>;

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
		readonly fresh: boolean;

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
		readonly stale: boolean;

		/**
		 * Provided hostname of the request. Not garunteed to be accurate, but is provided using the
		 * `Host` header in the HTTP request
		 */
		readonly hostname: string;

		/**
		 * Internet Protocal Address of the request.
		 * 
		 */
		readonly ip: string;

		/**
		 * Current HTTP Method of request. 
		 */
		readonly method: method;
		readonly originalUrl: toastiebun.path;

		/**
		 * The linked Response of the request.
		 * @see {@link response} 
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
		readonly params: {
			[key: string]: string
		};

		/**
		 * Search query of the request (if any)
		 * 
		 * @example
		 * '/users/search?name=john'
		 * // would result in a 'query' with:
		 * `{"name":"john"}`
		 */
		readonly query: URLSearchParams;

		/**
		 * Provides the current path of the request.
		 * 
		 * @see {@link server.use}
		 */
		path: toastiebun.path;

		/**
		 * HTTP Headers of the request.
		 * 
		 * @see {@link https://datatracker.ietf.org/doc/html/rfc2616#autoid-33}
		 */
		headers: Headers;

		/**
		 * Returns text as a promise.
		 * 
		 * @example
		 * const body = await req.text()
		 * console.log(body);
		 */
		text: () => Promise<string>;

		/**
		 * Returns json as a promise
		 * 
		 * @example
		 * const body = await req.json()
		 * console.log(json);
		 */
		json: () => Promise<unknown>;
		routeTrace: () => string[];
		upgrade: (serve: Server, handler: websocketHandler) => websocket;
		data: any;
	}

	export type cookieOptions = {
		domain?: string,
		expires?: Date,
		httpOnly?: boolean,
		maxAge?: Number,
		path?: toastiebun.path,
		secure?: boolean,
		signed?: boolean,
		sameSite?: boolean |
		"strict" | "Strict" |
		"lax" | "Lax" |
		"none" | "None"
	};

	export interface response {
		readonly app: server;
		readonly headerSent: boolean;
		locals: {
			[key: string]: string
		};
		append: (field: string, value?: string | string[]) => this;
		cookie: (name: string, value: any, options?: cookieOptions) => this;
		clearCookie: (name: string, options?: cookieOptions) => this;
		markNoCache: () => this;
		end: () => boolean;
		get: (field: string) => string | string[] | null;
		redirect: (path: string) => boolean;
		type: (type: string) => this;
		status: (code: toastiebun.httpStatus) => this;
		send: (body: any) => boolean;
		sendFile: (path: string, errCallback?: (err?: any) => void) => boolean;
		sendStatic: (path: string, errCallback?: (err?: any) => void) => boolean;
	}

	export interface websocketEvents {
		"data": [Buffer],
		"close": [number, string],
		"error": [Error]
	};

	// @ts-ignore // works anyway
	type eventHandler<events> = <ev extends keyof events>(eventName: ev, fn: ((...args: (events[ev])) => any)) => any;


	export interface websocket {
		on: eventHandler<websocketEvents>;
		once: eventHandler<websocketEvents>;
		send(m: string | Buffer | Uint8Array): boolean;
		close(code?: number, reason?: string): void;
	}
}
/**
 * @see {@link toastiebun.server} 
 */
export namespace toastiebun {

	/**
	 * Regular expression pattern to match strings resembling file paths.
	 *
	 * This regex pattern can be used to identify and validate strings that resemble
	 * file paths, including characters commonly found in paths such as letters,
	 * numbers, '/', '+', '-', '_', '.', and URL-encoded characters like `%20`.
	 *
	 * @constant
	 * @type {RegExp}
	 */
	export const pathLike: RegExp = /^([a-zA-Z0-9]|[\/+-_.]|\%[0-9a-fA-F][0-9a-fA-F])+$/;

	/**
	 * Strings resembling file paths.
	 *
	 * This type can be used to identify file paths, including characters
	 * commonly found in paths such as letters, numbers, '/', '+', '-', '_',
	 * '.', and URL-encoded characters like `%20`.
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
	 * @constant
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
	 * @inner
	 */
	export type method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "TRACE" | "CONNECT" | "*" | "MIDDLEWARE";

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
	 * @returns {void}
	 */
	export type handlerFunction = (req: request, res: response, next?: nextFn) => void;

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
	 * @inner
	 */
	export type handleDescriptor = {
		path: pathPattern,
		method: method,
		handler: handlerFunction | server
	};

	/**
	 * @template TBM - Marked **T**o **B**e **M**odified
	 * @inner
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
	 * @inner
	 */
	export type httpStatus = number | bigint;

	/**
	 * @template TBM - Marked **T**o **B**e **M**odified
	 * @inner
	 */
	export type httpBody = any;

	/**
	 * @template TBM - Marked **T**o **B**e **M**odified
	 */
	export type serverOptions = {

	};

	/**
	 * @template TBM - Marked **T**o **B**e **M**odified
	 */
	export interface server {
		get: catchDescriptor<this>;
		post: catchDescriptor<this>;
		put: catchDescriptor<this>;
		patch: catchDescriptor<this>;
		delete: catchDescriptor<this>;
		options: catchDescriptor<this>;
		trace: catchDescriptor<this>;
		connect: catchDescriptor<this>;
		all: catchDescriptor<this>;
		use: (path: pathPattern | pathPattern[] | server, middleware?: server) => this;
		trickleRequest: (req: request, res: response, next: nextFn) => boolean;
		listen: (host: string, port: number, fn: (server?: server) => any) => boolean;
	}

	/**
	 * @template TBM - Marked **T**o **B**e **M**odified
	 */
	export interface request {

		/**
		 * Represents the toastiebun {@link server} that is serving the request.
		 * @see {@link server}
		 */
		readonly app: server;

		//
		readonly baseUrl: toastiebun.path;

		readonly routeStack: toastiebun.path[];

		readonly cookies: { [key: string]: string | boolean; };

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
		readonly hostname: string;
		readonly ip: string;
		readonly method: method;
		readonly originalUrl: toastiebun.path;
		readonly res: response;
		readonly params: {
			[key: string]: string
		};
		readonly query: {
			[key: string]: string
		};
		path: toastiebun.path;
		get: (field: string) => string | null;
		text: () => Promise<string>;
		json: () => Promise<object>;
		routeTrace: () => string[]
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
	}
}
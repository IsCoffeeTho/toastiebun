import { BunFile, Server } from "bun";
import { Socket } from "net";
import { Headers } from "fetch";
import server from "./server";

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
	 */
	export const pathLike: RegExp = /^([a-zA-Z0-9]|[\/+-_.]|\%[0-9a-fA-F][0-9a-fA-F])+$/;
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
	export type method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "*" | "MIDDLEWARE" | "WS";

	/**
	 * @internal
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
	export type catchDescriptor<T> = (path: pathPattern, handler: T) => any;

	/**
	 * @see {@link catchDescriptor}
	 * @see {@link server}
	 * @internal
	 */
	export type route = {
		path: string,
		method: method,
	};

	/**
	 * @see {@link catchDescriptor}
	 * @see {@link server}
	 * @internal
	 */
	export type handleDescriptor = route & {
		handler: handlerFunction | server | websocketHandler
	};

	/**
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status}
	 */
	export enum HTTPStatus {
		// Informational responses (100–199)
		CONTINUE = 100,
		SWITCHING_PROTOCOLS = 101,
		PROCESSING = 102,
		EARLY_HINTS = 103,

		// Successful responses (200–299)
		OK = 200,
		CREATED = 201,
		ACCEPTED = 202,
		NON_AUTHORITATIVE_INFORMATION = 203,
		NO_CONTENT = 204,
		RESET_CONTENT = 205,
		PARTIAL_CONTENT = 206,
		MULTI_STATUS = 207,
		ALREADY_REPORTED = 208,
		IM_USED = 226,

		// Redirection messages (300–399)
		MULTIPLE_CHOICES = 300,
		MOVED_PERMANENTLY = 301,
		FOUND = 302,
		SEE_OTHER = 303,
		NOT_MODIFIED = 304,
		USE_PROXY = 305,
		TEMPORARY_REDIRECT = 307,
		PERMANENT_REDIRECT = 308,

		// Client error responses (400–499)
		BAD_REQUEST = 400,
		UNAUTHORIZED = 401,
		PAYMENT_REQUIRED = 402,
		FORBIDDEN = 403,
		NOT_FOUND = 404,
		METHOD_NOT_ALLOWED = 405,
		NOT_ACCEPTABLE = 406,
		PROXY_AUTHENTICATION_REQUIRED = 407,
		REQUEST_TIMEOUT = 408,
		CONFLICT = 409,
		GONE = 410,
		LENGTH_REQUIRED = 411,
		PRECONDITION_FAILED = 412,
		PAYLOAD_TOO_LARGE = 413,
		URI_TOO_LONG = 414,
		UNSUPPORTED_MEDIA_TYPE = 415,
		RANGE_NOT_SATISFIABLE = 416,
		EXPECTATION_FAILED = 417,
		I_M_A_TEAPOT = 418,
		MISDIRECTED_REQUEST = 421,
		UNPROCESSABLE_ENTITY = 422,
		LOCKED = 423,
		FAILED_DEPENDENCY = 424,
		TOO_EARLY = 425,
		UPGRADE_REQUIRED = 426,
		PRECONDITION_REQUIRED = 428,
		TOO_MANY_REQUESTS = 429,
		REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
		UNAVAILABLE_FOR_LEGAL_REASONS = 451,

		// Server error responses (500–599)
		INTERNAL_SERVER_ERROR = 500,
		NOT_IMPLEMENTED = 501,
		BAD_GATEWAY = 502,
		SERVICE_UNAVAILABLE = 503,
		GATEWAY_TIMEOUT = 504,
		HTTP_VERSION_NOT_SUPPORTED = 505,
		VARIANT_ALSO_NEGOTIATES = 506,
		INSUFFICIENT_STORAGE = 507,
		LOOP_DETECTED = 508,
		NOT_EXTENDED = 510,
		NETWORK_AUTHENTICATION_REQUIRED = 511
	}

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

	export interface websocketEvents {
		"data": [Buffer],
		"close": [number, string],
		"error": [Error]
	};

	// @ts-ignore // works anyway
	type eventHandler<events> = <ev extends keyof events>(eventName: ev, fn: ((...args: (events[ev])) => any)) => any;
}
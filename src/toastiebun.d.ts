import { BunFile, Server } from "bun";
import { Socket } from "net";
import { Headers } from "fetch";
import server from "./server";
import request from "./request";
import response from "./response";

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

	/**
	 * Regular expression pattern to match strings resembling Cookie Names.
	 *
	 * This regex pattern can be used to identify and validate strings that resemble
	 * cookie names.
	 * 
	 * > {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes}
	 * > 
	 * > A `<cookie-name>` can contain any US-ASCII characters except for: control characters ([ASCII](https://developer.mozilla.org/en-US/docs/Glossary/ASCII) characters 0 up to 31 and ASCII character 127) or separator characters (space, tab and the characters: `( ) < > @ , ; : \ " / [ ] ? = { }`)
	 * 
	 * @internal
	 * @type {RegExp}
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
	 * @internal
	 * @type {RegExp}
	 */
	export const pathPatternLike: RegExp = /^(([a-zA-Z0-9]|[\/+-_.]|\%[0-9a-fA-F][0-9a-fA-F])+\*{0,1}|\*)$/;

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
	 * 
	 * ## Note for Development
	 * You may notice the missing `HEAD`, `TRACE`, `CONNECTION` and `OPTIONS` methods. These methods are
	 * purposely omitted from the Library due to them already being handled
	 */
	export type method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	/** @internal */
	export type catchMethod = method | "*" | "MIDDLEWARE" | "WS";
	/** @ignore */
	export type HTTPMethod = method | "HEAD" | "TRACE" | "CONNCTION" | "OPTIONS";

	/** Anonymous function that can not be manipulated
	 * @see {@link handlerFunction}
	*/
	export type nextFn = () => any;

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
	 * @see
	 * {@link server.all}
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
	 * @ignore
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
		method: catchMethod,
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
	 * HTTP response status codes indicate whether a specific HTTP request has been successfully completed. Responses are grouped in five classes:
	 *
	 * 1. Informational responses (`100` – `199`)
	 * 2. Successful responses (`200` – `299`)
	 * 3. Redirection messages (`300` – `399`)
	 * 4. Client error responses (`400` – `499`)
	 * 5. Server error responses (`500` – `599`)
	 * 
	 * ## See Also
	 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status}
	 * @enum {number}
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
	 * 
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
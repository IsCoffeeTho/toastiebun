import { BunFile, Server } from "bun";
import { Socket } from "net";
import { Headers } from "fetch";
import server from "./server";
import request from "./request";
import response from "./response";
import websocket from "./websocket";

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
	export const cookieNameLike: RegExp = /[_!#$%'*+.^`|~a-zA-Z0-9\-]/g;

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
	
	export const MIMETypeOfExt = (type: string): string => {
		switch (type) {
			case "html":
			case "htm":
				return "text/html";
			case "css":
			case "style":
			case "stylesheet":
				return "text/css";
			case "txt":
			case "text":
				return "text/plain";
			case "js":
			case "javascript":
				return "text/javascript";
			case "json":
				return "application/json";
			case "jpeg":
			case "jpg":
				return "image/jpeg";
			case "png":
				return "image/png";
			case "gif":
				return "image/gif";
			case "svg":
				return "image/svg+xml";
			case "webp":
				return "image/webp";
			case "mp3":
				return "audio/mpeg";
			case "oga":
				return "audio/ogg";
			case "wav":
				return "audio/wav";
			case "mp4":
				return "video/mp4";
			case "webm":
				return "video/webm";
			case "ogv":
				return "video/ogg";
			case "xml":
				return "application/xml";
			case "atom":
				return "application/atom+xml";
			case "xhtml":
				return "application/xhtml+xml";
			case "js":
				return "application/javascript";
			case "webmanifest":
				return "application/manifest+json";
			case "eot":
				return "application/vnd.ms-fontobject";
			case "woff":
				return "application/font-woff";
			case "woff2":
				return "application/font-woff2";
			case "ttf":
				return "application/x-font-ttf";
			case "js":
				return "application/x-javascript";
			case "pdf":
				return "application/pdf";
			case "csv":
				return "text/csv";
			case "xml":
				return "text/xml";
			case "form":
				return "application/x-www-form-urlencoded";
			case "zip":
				return "application/x-zip-compressed";
			case "zip":
				return "application/zip";
			case "ico":
				return "image/x-icon";
			case "swf":
				return "application/x-shockwave-flash";
			case "rar":
				return "application/x-rar-compressed";
			case "tar":
				return "application/x-tar";
			case "":
			case "bin":
			case "exe":
			case "dll":
			case "class":
				return "application/octet-stream";
			case "eml":
				return "message/rfc822";
			case "ogx":
				return "application/ogg";
			case "avi":
				return "video/x-msvideo";
			case "wmv":
				return "video/x-ms-wmv";
			case "7z":
				return "application/x-7z-compressed";
			case "bz":
				return "application/x-bzip";
			case "bz2":
				return "application/x-bzip2";
			case "aif":
			case "aiff":
			case "aifc":
				return "audio/x-aiff";
			case "flac":
				return "audio/x-flac";
			case "bmp":
				return "image/bmp";
			case "tiff":
			case "tif":
				return "image/tiff";
			case "xls":
				return "application/vnd.ms-excel";
			case "doc":
				return "application/vnd.ms-word";
			case "ppt":
				return "application/vnd.ms-powerpoint";
			case "docx":
				return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
			case "xlsx":
				return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
			case "pptx":
				return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
			case "epub":
				return "application/epub+zip";
			case "msi":
				return "application/x-msi";
			case "exe":
				return "application/x-dosexec";
			case "jar":
				return "application/x-java-archive";
			case "pem":
				return "application/x-pem-file";
			case "p12":
			case "pfx":
				return "application/x-pkcs12";
			case "p7b":
			case "spc":
				return "application/x-pkcs7-certificates";
			case "p7r":
				return "application/x-pkcs7-certreqresp";
			case "woff":
				return "application/x-font-woff";
			case "woff2":
				return "application/x-font-woff2";
			case "mid":
			case "midi":
				return "audio/midi";
			case "ra":
				return "audio/vnd.rn-realaudio";
			case "obj":
				return "model/obj";
			case "igs":
			case "iges":
				return "model/iges";
			case "sh":
				return "application/x-sh";
			case "csh":
				return "application/x-csh";
			case "rb":
				return "application/x-ruby";
			case "pl":
				return "application/x-perl";
			case "mdb":
				return "application/x-ms-access";
			case "exe":
				return "application/x-ms-dos-executable";
			case "tar.gz":
			case "tgz":
				return "application/x-compressed";
			case "xz":
				return "application/x-xz";
			case "lz":
				return "application/x-lzip";
			case "lzma":
				return "application/x-lzma";
			case "xar":
				return "application/x-xar";
			case "sit":
				return "application/x-stuffit";
			case "odt":
				return "application/vnd.oasis.opendocument.text";
			case "ods":
				return "application/vnd.oasis.opendocument.spreadsheet";
			case "odg":
				return "application/vnd.oasis.opendocument.drawings";
			case "odg":
				return "application/vnd.oasis.opendocument.graphics";
			case "odc":
				return "application/vnd.oasis.opendocument.chart";
			case "odf":
				return "application/vnd.oasis.opendocument.formula";
		}
	}

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

	/**
	 * Simple Function type to be used in the `next()` system.
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
	 * @param {websocket} ws - The Websocket to hook.
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
		path: string;
		method: catchMethod;
	};

	/**
	 * @see {@link catchDescriptor}
	 * @see {@link server}
	 * @internal
	 */
	export type handleDescriptor = route & {
		handler: handlerFunction | server | websocketHandler;
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
		NETWORK_AUTHENTICATION_REQUIRED = 511,
	}

	/**
	 *
	 */
	export type serverOptions = {
		tls?: {
			key: BunFile;
			cert: BunFile;
		};
		defaultCookieOptions?: cookieOptions;
	};

	export type cookie = {
		value: string;
	} & cookieOptions;

	/**
	 * 
	 */
	export type cookieOptions = {
		/**
		 * Defines the host to which the cookie will be sent.
		 *
		 * Only the current domain can be set as the value, or a domain of a higher order unless it is a public suffix.
		 * Setting the domain will make the cookie available to it, as well as to all its subdomains.
		 *
		 * If omitted, the cookie is return only to the host that sent them (i.e., it becomes a "host-only cookie"). this is more restrictive than setting the
		 * host name, as the cookie is not made available to the subdomains of the host.
		 *
		 * Contrary to earlier specifications, leading dots in domain names (`.example.com`) are ignored.
		 *
		 * Multiple host/domain values are *not* allowed, but if a domain *is* specified, then subdomains are always include.
		 * 
		 * --- 
		 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#domaindomain-value source}
		 */
		domain?: string;
		/**
		 * Indicates the maximum lifetime of the cookie as a {@link Date}.
		 *
		 * If unspecified, the cookie becomes a **session cookie**. A session finishes when the client shuts down, after which the session cookie is removed.
		 * If both `Expires` and `Max-Age` are set, `Max-Age` has precedence.
		 * 
		 * --- 
		 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#expiresdate source}
		 */
		expires?: Date;
		/**
		 * Forbids JavaScript from accessing the cookie, for example, though the `Document.cookie` property. Note that a cookie that has been created with
		 * `HttpOnly` will stell be sent with JavaScript initiated requests, for example, when calling `XMLHttpRequest.send()` or `fetch()`. This mitigates
		 * attacks against cross-site scripting ({@link https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting `XSS`})
		 * 
		 * ---
		 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#httponly source}
		 */
		httpOnly?: boolean;
		/**
		 * Indicates the number of seconds until the cookie expires. A zero or negative number will expire the cookie immediately.
		 * If both `Expires` and `Max-Age` are set, `Max-Age` has precedence.
		 * 
		 * ---
		 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#max-agenumber source}
		 */
		maxAge?: Number;
		/**
		 * Indicates the path that *must* exist in the requested URL for the browser to send the `Cookie` header.
		 * If omitted, this attribute defaults to the path component of the request URL.
		 * For example, if a cookie is set by a request to `https://example.com/docs/Web/HTTP/index.html`, the default path would be `/docs/Web/HTTP/`.
		 * 
		 * ---
		 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#pathpath-value source}
		 */
		path?: toastiebun.path;
		/**
		 * Controls whether or not a cookie is sent with cross-site requests: that is, requests originating from a different site, including the scheme,
		 * from the side that set the cookie. This provides some protection against certain cross-site attacks,
		 * including {@link https://developer.mozilla.org/en-US/docs/Glossary/CSRF cross-site requests forgery (CSRF)} attacks.
		 * 
		 * The possible attribute values are:
		 * ## `Strict` 
		 * Send the cookie only for requests originating from the same site that set the cookie.
		 * ## `Lax`
		 * Send the cookie only for requests originating from the same site that set the cookie, and for
		 * cross-site requests that meet both of the following criteria:  
		 * - The request is a top-level navigation: this essentially means that the request causes the URL shown in the browser's address bar to change.
		 *   - This would exclude, for example, requests made using the {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch `fetch()`} API,
		 * 	   or requests from subresources from {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img `<img>`} or
		 *     {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script `<script>`} elements, or navigations inside
		 *     {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe `<iframe>`} elements.
		 *   - It would include requests made when the user clicks a link in the top-level browsing context from one site to another, or an assignment to
		 *     {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/location `document.location`}, or a
		 *     {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form `<form>`} submission.
		 * - The request uses a {@link https://developer.mozilla.org/en-US/docs/Glossary/Safe/HTTP safe} method: in particular, this excludes
		 *   {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST `POST`},
		 *   {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PUT `PUT`}, and
		 *   {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/DELETE `DELETE`}.
		 * 
		 * > [!NOTE]
		 * > **NOTE:** When `Lax` is applied as a default, a more permissive version is used. In this more permissive version, cookies are also included in
		 * > {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST `POST`} requests, as long as they were set no more than
		 * > two minutes before the request was made.
		 * ## `None`
		 * Send the cookie with both cross-site and same-site requests. the `Secure` attribute must also be sent when using this value.
		 * 
		 * --- 
		 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value source}
		 */
		sameSite?: boolean | "Strict" | "Lax" | "None";
		/**
		 * Indicates that the cookie is sent to the server only when a request is made with the `https:` scheme (except on localhost),
		 * and therefore is more resistant to {@link https://developer.mozilla.org/en-US/docs/Glossary/MitM man-in-the-middle} attacks.
		 * > [!NOTE]
		 * > **NOTE:** Do not assume that `Secure` prevents all access to sensitive information in cookies (session keys, login details, etc.).
		 * > Cookies with this attribute can still be read/modified either with access to the client's hard disk or from JavaScript if the
		 * > {@linkcode cookieOptions.httpOnly HttpOnly} cookie attribute is not set.
		 * > 
		 * > ```ts
		 * > res.cookie("secure-cookie", "super-secret-value", {
		 * > 	secure: true,
		 * > 	httpOnly: true,
		 * > }).send("Secured a cookie!");
		 * > ```
		 * >
		 * > Insecure sites (`http:`) cannot set cookies with the `Secure` attribute. The `https:` requirements are ignored when the `Secure` attribute
		 * > is set by localhost. 
		 * --- 
		 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#secure source}
		 */
		secure?: boolean;
	};

	export interface websocketEvents {
		data: [Buffer];
		close: [number, string];
		error: [Error];
	}
}

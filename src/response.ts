import { BunFile } from "bun";
import { existsSync, statSync } from "fs";
import { isReadable } from "stream";
import server from "./server";

// @ts-ignore // just imports version number
import thispkg from "../package.json";
import { cookie, cookieOptions, HTTPStatus, MIMETypeOfExt, pathLike } from "./utils";

export const cookieNameLike: RegExp = /[_!#$%'*+.^`|~a-zA-Z0-9\-]/g;

/**
 * @hideconstructor
 */
export default class response {
	protected body: any;
	protected statusCode: HTTPStatus;
	protected headers: Headers;
	protected contentType: string | null;
	protected sentHeaders: boolean = false;
	protected parent: server;
	protected cookies: Map<string, cookie>;
	protected req: Request;
	protected defaultCookieOptions: cookieOptions;
	constructor(parent: server, req: Request, defaultCookieOptions: cookieOptions) {
		this.parent = parent;
		this.req = req;
		this.statusCode = 200;
		this.body = null;
		this.cookies = new Map();
		this.headers = <Headers>new Headers();
		this.contentType = null;
		this.defaultCookieOptions = defaultCookieOptions;
	}

	/**
	 * The parent toastiebun server
	 */
	get app() {
		return this.parent;
	}

	/**
	 * Indicates that request has been handled
	 */
	get headerSent() {
		return this.sentHeaders;
	}

	/**
	 * Retrieve a header that has been added to the response;
	 */
	get(field: string) {
		return this.headers.get(field);
	}

	/**
	 * Set a header value in the response
	 */
	append(field: string, value?: string | string[]) {
		if (this.sentHeaders) throw response.InvalidHeaderAccess;
		if (field == "Set-Cookie") throw new Error("The Toastiebun module is not allowing you to set a cookie with the append function.");
		if (!value) value = [""];
		if (typeof value == "string") value = [value];
		value.map(v => {
			this.headers.append(field, v);
		});
		return this;
	}

	/**
	 * Set a cookie with a value
	 */
	cookie(name: string, value: any, options?: cookieOptions) {
		if (this.sentHeaders) throw response.InvalidHeaderAccess;
		if (!name.match(cookieNameLike)) throw new SyntaxError(`cookie name "${name}" has invalid characters.`);
		options = Object.assign(Object.assign({}, this.defaultCookieOptions), options);
		this.cookies.set(name, {
			value,
			...options,
		});
		return this;
	}

	/**
	 * Remove a cookie
	 *
	 * @see {@linkcode response.cookie `res.cookie`}
	 */
	clearCookie(name: string) {
		if (this.sentHeaders) throw response.InvalidHeaderAccess;
		if (!name.match(cookieNameLike)) throw new SyntaxError(`cookie name "${name}" has invalid characters.`);
		this.cookies.set(name, {
			value: "",
			maxAge: 0,
			path: "/",
		});
		return this;
	}

	/**
	 * Forcefully tells the browser not to store a copy locally for caching reasons.
	 *
	 * Sets the `Cache-Control` header to `no-store`
	 */
	disableCache() {
		if (this.sentHeaders) throw response.InvalidHeaderAccess;
		this.headers.set("Cache-Control", "no-store");
		return this;
	}

	/**
	 * Sets the HTTP status code of the response.
	 *
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status HTTP status codes}
	 */
	status(code: HTTPStatus) {
		if (this.sentHeaders) throw response.InvalidHeaderAccess;
		this.statusCode = code;
		return this;
	}

	/**
	 * Marks that the request is finished being processed
	 */
	end() {
		if (this.sentHeaders) throw response.InvalidHeaderAccess;
		this.sentHeaders = true;
		return true;
	}

	/**
	 *
	 */
	error(code: number, message: string) {
		this.status(code).send({
			error: {
				code,
				message,
			},
		});
	}

	/**
	 *
	 */
	send(body: any) {
		this.end();
		if (this.body satisfies BunFile) {
			this.body = body;
			if (this.contentType == null) this.contentType = (<BunFile>body).type;
		} else if (isReadable(body)) {
			this.body = (<ReadableStream>body).bytes();
		} else if (Buffer.isBuffer(body)) {
			this.body = body.toString();
		} else
			switch (typeof body) {
				case "object":
					this.body = JSON.stringify(body);
					if (this.contentType == null) this.contentType = "application/json";
					break;
				default:
					this.body = `${body}`;
					if (this.contentType == null) this.contentType = "text/plain";
					break;
			}
		return true;
	}

	/**
	 * Based on caching headers, will send only if the cached version is stale or not present
	 */
	sendStatic(path: string, errorCallback?: (err?: Error) => any): boolean {
		var retval = this.sendFile(path, errorCallback);
		if (!retval) return false;
		var lastModified = new Date((<BunFile>this.body).lastModified);
		lastModified.setMilliseconds(0);
		if (this.req.headers.has("If-Modified-Since")) {
			var modifiedSince = new Date(<string>this.req.headers.get("If-Modified-Since"));
			if (modifiedSince >= lastModified) {
				this.body = null;
				this.statusCode = HTTPStatus.NOT_MODIFIED;
			}
		} else this.headers.set("Last-Modified", lastModified.toUTCString());
		return retval;
	}

	/**
	 * Will send a file through the BunFile type.
	 */
	sendFile(path: string, errorCallback?: (err?: Error) => any): boolean {
		try {
			if (this.sentHeaders) throw response.InvalidHeaderAccess;
			if (!pathLike.test(path)) throw new TypeError("path is not pathLike");
			if (!existsSync(path)) throw new Error("ENOENT");
			var stat = statSync(path);
			if (!stat.isFile() && !stat.isFIFO()) throw new Error("File must be regular or FIFO");
			var body = Bun.file(path);
			this.body = body;
			if (body.size == 0 && Math.floor(<number>this.statusCode / 100) == 2) {
				this.statusCode = HTTPStatus.NO_CONTENT;
				this.body = "";
			}
			if (this.contentType == null) this.contentType = body.type;
			this.sentHeaders = true;
		} catch (err: any) {
			if (!errorCallback) throw err;
			errorCallback(<Error>err);
			return false;
		}
		return true;
	}

	/**
	 * Informs the client about the media type of the returned data.
	 *
	 */
	type(type: string) {
		this.contentType = MIMETypeOfExt(type) ?? type;
		return this;
	}

	redirect(path: string, errorCallback?: (err?: Error) => any): boolean {
		try {
			if (this.sentHeaders) throw response.InvalidHeaderAccess;
			this.headers.set("Location", path);
			if (this.statusCode < 300 || this.statusCode >= 400) this.statusCode = HTTPStatus.TEMPORARY_REDIRECT;
			this.body = "";
			this.sentHeaders = true;
		} catch (err: any) {
			if (!errorCallback) throw err;
			errorCallback(<Error>err);
			return false;
		}
		return true;
	}

	/**
	 * @TODO re implement for a more robust response build system
	 * @inner
	 */
	get asBunResponse() {
		if ((this.body satisfies BunFile) && (<BunFile>this.body).size == 0) this.body = "";

		if (this.contentType != null) this.headers.set("Content-Type", this.contentType);

		this.cookies.forEach((v, k) => {
			var cookieString = `${encodeURI(k)}=${encodeURI(`${v.value}`)}`;
			if (v.expires) {
				cookieString += `; Expires=`;
				cookieString += `"${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].at(v.expires.getDay())}, `;
				cookieString += `${v.expires.getDate().toString().padStart(2, "00")} `;
				cookieString += `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].at(v.expires.getMonth())} `;
				cookieString += `${v.expires.getFullYear().toString().padStart(4, "0000")} `;
				cookieString += `${v.expires.getHours().toString().padStart(2, "00")}:`;
				cookieString += `${v.expires.getMinutes().toString().padStart(2, "00")}:`;
				cookieString += `${v.expires.getSeconds().toString().padStart(2, "00")} GMT`;
			}
			if (v.maxAge != undefined) cookieString += `; Max-Age=${v.maxAge}`;
			if (v.domain) cookieString += `; Domain=${v.domain}`;
			if (v.sameSite != undefined) {
				var sameSite = "Strict";
				switch (v.sameSite) {
					case false:
					case "None":
						sameSite = "None";
						break;
					case "Lax":
						sameSite = "Lax";
						break;
					case true:
					case "Strict":
					default:
						sameSite = "Strict";
						break;
				}
				cookieString += `; SameSite=${sameSite}`;
			}
			if (v.path) cookieString += `; Path=${v.path}`;
			if (v.secure) cookieString += `; Secure`;
			if (v.httpOnly) cookieString += `; HttpOnly`;
			this.headers.append("Set-Cookie", cookieString);
		});

		this.headers.set("X-Powered-By", `ToastieBun v${thispkg.version}`);

		return new Response(this.body, {
			status: this.statusCode,
			headers: this.headers,
		});
	}

	static InvalidHeaderAccess = new Error("Invalid Header Access, can not modify headers after sending.");
}

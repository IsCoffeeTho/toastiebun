import { BunFile } from "bun";
import { existsSync, statSync } from "fs";
import { toastiebun } from "./toastiebun.d";
import server from "./server";
import request from "./request";

// @ts-ignore // just imports version number
import thispkg from "../package.json";

/**
 * @TODO remake the #httpframe field to allow a more dynamic creation system of the bun response
 * @hideconstructor
 */
export default class response {
	#body: any;
	#status: toastiebun.HTTPStatus;
	#headers: Headers;
	#contentType: string | null;
	#sentHeaders: boolean = false;
	#parent: server;
	#cookies: Map<string, string | boolean>;
	#req: Request;
	locals: { [key: string]: string };
	constructor(parent: server, req: Request) {
		this.#parent = parent;
		this.#req = req;
		this.#status = 200;
		this.#body = null;
		this.#cookies = new Map();
		this.#headers = <Headers>new Headers();
		this.locals = {};
		this.#contentType = null;
	}

	get app() {
		return this.#parent;
	}

	get headerSent() { return this.#sentHeaders; }

	get(field: string) {
		return this.#headers.get(field);
	}

	append(field: string, value?: string | string[]) {
		if (this.#sentHeaders)
			throw response.#InvalidHeaderAccess;
		if (field == "Set-Cookie")
			throw new Error("The Toastiebun module is not allowing you to set a cookie with the append function.");
		if (!value)
			value = [""];
		if (typeof value == "string")
			value = [value];
		value.map((v) => {
			this.#headers.append(field, v);
		})
		return this;
	}

	cookie(name: string, value: any, options?: toastiebun.cookieOptions) {
		if (this.#sentHeaders)
			throw response.#InvalidHeaderAccess;
		if (!name.match(toastiebun.cookieNameLike))
			throw new SyntaxError(`cookie name "${name}" has invalid characters `);
		if (!options) {
			this.#cookies.set(name, `${value}; Path=/`);
			return this;
		}
		if (options.domain)
			value += `; Domain=${options.domain}`;
		if (options.expires)
			value += `; Expires=${options.expires.toUTCString()}`;
		if (options.httpOnly)
			value += `; HttpOnly`;
		if (options.maxAge)
			value += `; Max-Age=${options.maxAge}`;
		if (options.path)
			value += `; Path=${options.path}`;
		else
			value += `; Path=/`;
		if (options.secure)
			value += `; Secure`;
		if (options.sameSite) {
			if (typeof options.sameSite == "boolean")
				value += `; SameSite=Strict`;
			else
				switch (options.sameSite.toLocaleLowerCase()) {
					case "strict": value += `; SameSite=Strict`; break;
					case "lax": value += `; SameSite=Lax`; break;
					case "none":
						value += `; SameSite=None`;
						if (!options.secure)
							value += `; Secure`;
						break;
					default:
						throw new TypeError(`Invalid sameSite Directive, Allowed values:\ntrue, "Strict", "Lax", "None"`);
				}
		}
		this.#cookies.set(name, value);
		return this;
	}

	clearCookie(name: string) {
		if (this.#sentHeaders)
			throw response.#InvalidHeaderAccess;
		if (!name.match(toastiebun.cookieNameLike))
			throw new SyntaxError(`cookie name "${name}" has invalid characters `);
		this.#cookies.set(name, "; Max-Age=0; Path=/");
		return this;
	}

	markNoCache() {
		if (this.#sentHeaders)
			throw response.#InvalidHeaderAccess;
		this.#headers.set("Cache-Control", "no-store");
		return this;
	}

	status(code: toastiebun.HTTPStatus) {
		if (this.#sentHeaders)
			throw response.#InvalidHeaderAccess;
		this.#status = code;
		return this;
	}

	end() {
		if (this.#sentHeaders)
			throw response.#InvalidHeaderAccess;
		this.#sentHeaders = true;
		return true;
	}

	send(body: any) {
		if (this.#sentHeaders)
			throw response.#InvalidHeaderAccess;
		this.#sentHeaders = true;
		if (this.#body satisfies BunFile) {
			this.#body = body;
			if (this.#contentType == null)
				this.#contentType = (<BunFile>body).type;
		} else if (Buffer.isBuffer(body)) {
			this.#body = body.toString();
		} else switch (typeof body) {
			case "object":
				this.#body = JSON.stringify(body);
				if (this.#contentType == null)
					this.#contentType = "application/json";
				break;
			default:
				this.#body = `${body}`;
				if (this.#contentType == null)
					this.#contentType = "text/plain";
				break;
		}
		return true;
	}

	sendStatic(path: string, errorCallback?: (err?: Error) => any): boolean {
		var retval = this.sendFile(path, errorCallback);
		if (!retval)
			return false;
		var lastModified = new Date((<BunFile>this.#body).lastModified);
		lastModified.setMilliseconds(0);
		if (this.#req.headers.has('If-Modified-Since')) {
			var modifiedSince = new Date((<string>this.#req.headers.get('If-Modified-Since')));
			if (modifiedSince >= lastModified) {
				this.#body = null;
				this.#status = toastiebun.HTTPStatus.NOT_MODIFIED;
			}
		} else
			this.#headers.set("Last-Modified", lastModified.toUTCString());
		return retval;
	}

	sendFile(path: string, errorCallback?: (err?: Error) => any): boolean {
		try {
			if (this.#sentHeaders)
				throw response.#InvalidHeaderAccess;
			if (!toastiebun.pathLike.test(path))
				throw new TypeError("path is not toastiebun.pathLike");
			if (!existsSync(path))
				throw new Error("ENOENT");
			var stat = statSync(path);
			if (!stat.isFile() && !stat.isFIFO())
				throw new Error("File must be regular or FIFO");
			var body = Bun.file(path);
			this.#body = body;
			if (body.size == 0 && Math.floor((<number>this.#status) / 100) == 2) {
				this.#status = toastiebun.HTTPStatus.NO_CONTENT;
				this.#body = "";
			}
			if (this.#contentType == null)
				this.#contentType = body.type;
			this.#sentHeaders = true;
		} catch (err: any) {
			if (!errorCallback)
				throw err;
			errorCallback(<Error>err);
			return false;
		}
		return true;
	}

	type(type: string) {
		switch (type) {
			case "text":
			case "plain":
			case "txt":
			case ".txt":
				this.#contentType = "text/plain";
				break;
			case "html":
			case ".html":
			case ".htm":
			case ".htmx":
				this.#contentType = "text/html";
				break;
			case "json":
			case "object":
			case ".json":
				this.#contentType = "application/json";
				break;
			case "xml":
			case ".xml":
				this.#contentType = "text/xml";
				break;
			default:
				this.#contentType = type;
				break;
		}
		return this;
	}

	redirect(path: string, errorCallback?: (err?: Error) => any): boolean {
		try {
			if (this.#sentHeaders)
				throw response.#InvalidHeaderAccess;
			this.#headers.set("Location", path);
			if (this.#status < 300 || this.#status >= 400)
				this.#status = toastiebun.HTTPStatus.TEMPORARY_REDIRECT;
			this.#body = "";
			this.#sentHeaders = true;
		} catch (err: any) {
			if (!errorCallback)
				throw err;
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
		if (this.#body satisfies BunFile && (<BunFile>this.#body).size == 0)
			this.#body = "";

		if (this.#contentType != null)
			this.#headers.set("Content-Type", this.#contentType);

		this.#cookies.forEach((v, k) => {
			this.#headers.append("Set-Cookie", `${k}=${v}`);
		})

		return new Response(this.#body, {
			status: this.#status,
			headers: this.#headers
		});
	}

	static #InvalidHeaderAccess = new Error("Invalid Header Access, can not modify headers after sending.");

}
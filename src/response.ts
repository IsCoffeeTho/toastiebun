import { BunFile } from "bun";
import { existsSync, statSync } from "fs";
import { toastiebun } from "./toastiebun.d";
import server from "./server";

// @ts-ignore // just imports version number
import thispkg from "../package.json";

/**
 * @TODO remake the #httpframe field to allow a more dynamic creation system of the bun response
 * @hideconstructor
 */
export default class response {
	#body: toastiebun.httpBody;
	#status: toastiebun.HTTPStatus;
	#headers: {
		[field: string]: string[]; // each line in an array is condidered another header entry of the same field
	};
	#contentType: string | null;
	#sentHeaders: boolean = false;
	#parent: server;
	#cookies: { [key: string]: string };
	#req: Request;
	locals: { [key: string]: string };
	constructor(parent: server, req: Request) {
		this.#parent = parent;
		this.#req = req;
		this.#status = 200;
		this.#body = null;
		this.#cookies = {};
		this.#headers = {};
		this.locals = {};
		this.#contentType = null;
	}

	get app() {
		return this.#parent;
	}

	get headerSent() { return this.#sentHeaders; }

	get(field: string) {
		if (!this.#headers[field])
			return null;
		return this.#headers[field];
	}

	append(field: string, value?: string | string[]) {
		if (this.#sentHeaders)
			throw response.#InvalidHeaderAccess;
		if (field == "Set-Cookie")
			throw new Error("The Toastiebun module is not allowing you to set a cookie with the append function.");
		if (!this.#headers[field])
			this.#headers[field] = [];
		if (typeof value == "object")
			this.#headers[field].push(...value);
		else if (typeof value == "string")
			this.#headers[field].push(value);
		return this;
	}

	cookie(name: string, value: any, options?: toastiebun.cookieOptions) {
		if (this.#sentHeaders)
			throw response.#InvalidHeaderAccess;
		if (!toastiebun.cookieNameLike.test(name))
			throw new SyntaxError("name has invalid characters");
		this.#cookies[name] = `${value}`;
		if (!options)
			return this;
		if (options.domain)
			this.#cookies[name] += `; Domain=${options.domain}`;
		if (options.expires)
			this.#cookies[name] += `; Expires=${options.expires.toUTCString()}`;
		if (options.httpOnly)
			this.#cookies[name] += `; HttpOnly`;
		if (options.maxAge)
			this.#cookies[name] += `; Max-Age=${options.maxAge}`;
		if (options.path)
			this.#cookies[name] += `; Path=${options.path}`;
		if (options.secure)
			this.#cookies[name] += `; Secure`;
		if (options.sameSite) {
			if (typeof options.sameSite == "boolean")
				this.#cookies[name] += `; SameSite=Strict`;
			else
				switch (options.sameSite.toLocaleLowerCase()) {
					case "strict": this.#cookies[name] += `; SameSite=Strict`; break;
					case "lax": this.#cookies[name] += `; SameSite=Lax`; break;
					case "none":
						this.#cookies[name] += `; SameSite=None`;
						if (!options.secure)
							this.#cookies[name] += `; Secure`;
						break;
					default:
						throw new TypeError(`Invalid sameSite Directive, Allowed values:\ntrue, "Strict", "Lax", "None"`);
				}
		}
		return this;
	}

	clearCookie(name: string) {
		if (this.#sentHeaders)
			throw response.#InvalidHeaderAccess;
		if (!toastiebun.cookieNameLike.test(name))
			throw new SyntaxError("name has invalid characters");
		this.#cookies[name] = "; Max-Age=0";
		return this;
	}

	markNoCache() {
		if (this.#sentHeaders)
			throw response.#InvalidHeaderAccess;
		this.#headers["Cache-Control"] = ["no-store"];
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

	sendStatic(path: toastiebun.path, errorCallback?: (err?: Error) => any): boolean {
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
			this.#headers["Last-Modified"] = [lastModified.toUTCString()];
		return retval;
	}

	sendFile(path: toastiebun.path, errorCallback?: (err?: Error) => any): boolean {
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

	redirect(path: string) {
		this.#headers["Location"] = [path];
		if (this.#status < 300 && this.#status >= 400)
			this.#status = toastiebun.HTTPStatus.MOVED_PERMANENTLY;
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
			this.#headers["Content-Type"] = [this.#contentType];

		var cookieHeaders: string[] = [];

		for (var cookie in this.#cookies) {
			var value = this.#cookies[cookie];
			cookieHeaders.push(`${cookie}=${value}`);
		}

		return new Response(this.#body, {
			status: this.#status,
			headers: {
				...this.#headers,
				...(cookieHeaders.length > 0 ? {
					'Set-Cookie': cookieHeaders
				} : {}),
				"X-Powered-By": `ToastieBun v${thispkg.version}`
			}
		});
	}

	static #InvalidHeaderAccess = new Error("Invalid Header Access, can not modify headers after sending.");

}
import { BunFile } from "bun";
import { existsSync } from "fs";
import server from "./server";
import { toastiebun } from "./toastiebun";

const thispkg = require("../package.json");

/**
 * @todo remake the #httpframe field to allow a more dynamic creation system of teh bun response
 */
export default class response implements toastiebun.response {
	#body: toastiebun.httpBody;
	#status: toastiebun.httpStatus;
	#headers: {
		[field: string]: string[]; // each line in an array is condidered another header entry of the same field
	};
	#contentType: string | null;
	#sentHeaders: boolean = false;
	#parent: server;
	locals: { [key: string]: string };
	#cookies: { [key: string]: string };
	#req: Request;
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
		this.#cookies[name] = `"${value}"`;
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

	status(code: toastiebun.httpStatus) {
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
		if (this.#body satisfies BunFile) {
			this.#body = body;
			if (this.#contentType == null)
				this.#contentType = (<BunFile>body).type;
		} else if (Buffer.isBuffer(body)) {
			this.#body = body.toString();
		} else
			switch (typeof body) {
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
		this.#sentHeaders = true;
		return true;
	}

	sendStatic(path: toastiebun.path, errorCallback?: (err?: any) => any) {
		this.sendFile(path, errorCallback);
		var lastModified = new Date((<BunFile>this.#body).lastModified);
		lastModified.setMilliseconds(0);
		if (this.#req.headers.has('If-Modified-Since')) {
			var modifiedSince = new Date((<string>this.#req.headers.get('If-Modified-Since')));
			if (modifiedSince >= lastModified) {
				this.#body = null;
				this.#status = 304;
			}
		} else
			this.#headers["Last-Modified"] = [lastModified.toUTCString()];
		return this;
	}

	sendFile(path: toastiebun.path, errorCallback?: (err?: any) => any) {
		if (this.#sentHeaders)
			throw response.#InvalidHeaderAccess;
		if (!toastiebun.pathLike.test(path))
			throw new TypeError("path is not toastiebun.pathLike");
		try {
			if (!existsSync(path))
				throw new Error("ENOENT");
			var body = Bun.file(path);
			this.#body = body;
			if (body.size == 0 && this.#status == 200) {
				this.#status = 204;
				this.#body = "";
			}
			if (this.#contentType == null)
				this.#contentType = body.type;
			this.#sentHeaders = true;
		} catch (err) {
			if (!errorCallback)
				throw err;
			errorCallback(err);
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
			this.#status = 301;
		return true;
	}

	/**
	 * @todo re implement for a more robust response build system
	 * @inner
	 */
	get asBunResponse() {
		if (this.#body satisfies BunFile && (<BunFile>this.#body).size == 0)
			this.#body = "";
		return new Response(this.#body, {
			status: this.#status,
			headers: {
				...this.#headers,
				"X-Powered-By": `ToastieBun v${thispkg.version}`
			}
		});
	}

	static #InvalidHeaderAccess = new Error("Invalid Header Access, can not modify headers after sending.");

}
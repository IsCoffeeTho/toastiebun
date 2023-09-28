import { BunFile } from "bun";
import { existsSync } from "fs";
import { toastiebun } from "./toastiebun";
import server from "./server";

const thispkg = require("../package.json");

export default class response {
	#httpframe: toastiebun.httpFrame;
	#sentHeaders: boolean = false;
	#parent: server;
	constructor(parent: server) {
		this.#parent = parent;
		this.#httpframe = {
			status: 200,
			headers: {},
			body: null
		};
	}

	status(code: number) {
		this.#httpframe.status = code;
		return this;
	}

	send(body: any) {
		if (this.#httpframe.body satisfies BunFile) {
			this.#httpframe.body = body;
			this.#httpframe.headers["Content-Type"] = (<BunFile>body).type;
		} else if (Buffer.isBuffer(body)) {
			this.#httpframe.body = body.toString();
		} else
			switch (typeof body) {
				case "object":
					this.#httpframe.body = JSON.stringify(body);
					this.#httpframe.headers["Content-Type"] = "application/json";
					break;
				default:
					this.#httpframe.body = `${body}`;
					break;
			}
		this.#sentHeaders = true;
	}

	sendFile(path: string, errorCallback?: (err?: any) => any) {
		try {
			var err = new Error("ENOENT");
			if (!existsSync(path))
				throw err;
			var body = Bun.file(path);
			if (body.size == 0)
					throw err;
			this.#httpframe.body = body;
			this.#httpframe.headers["Content-Type"] = body.type;
			this.#sentHeaders = true;
		} catch (err) {
			if (errorCallback)
				errorCallback(err);
			else
				throw err;
			return false;
		}
		return true;
	}

	get asBunResponse() {
		if (this.#httpframe.body satisfies BunFile && (<BunFile>this.#httpframe.body).size == 0)
			throw new Error("ENOENT");
		return new Response(this.#httpframe.body, {
			status: this.#httpframe.status,
			headers: {
				...this.#httpframe.headers,
				"X-Powered-By": `ToastieBun v${thispkg.version}`
			}
		});
	}

	get headerSent() {
		return this.#sentHeaders;
	}

	get app() {
		return this.#parent;
	}
}
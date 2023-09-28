import { BunFile } from "bun";
import { existsSync } from "fs";
import server from "./server";
import { toastiebun } from "./toastiebun";

const thispkg = require("../package.json");

export default class response implements toastiebun.response {
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
		return true;
	}

	sendFile(path: toastiebun.path, errorCallback?: (err?: any) => any) {
		if (!toastiebun.pathLike.test(path))
			throw new TypeError("path is not toastiebun.pathLike");
		try {
			if (!existsSync(path))
				throw new Error("ENOENT");
			var body = Bun.file(path);
			this.#httpframe.body = body;
			if (body.size == 0 && this.#httpframe.status == 200) {
				this.#httpframe.status = 204;
				this.#httpframe.body = "";
			}
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
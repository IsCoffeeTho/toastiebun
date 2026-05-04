import server from "./server";
import response from "./response";
import { cookieOptions } from "./utils";

// @ts-ignore // just imports version number
import thispkg from "../package.json";

/**
 * @hideconstructor
 */
export default class optionsResponse extends response {
	constructor(parent: server, req: Request, defaultCookieOptions: cookieOptions) {
		super(parent, req, defaultCookieOptions);
	}
	
	allowOrigin(origin: string) {
		let accessControlAllowOrigin = this.headers.has("Access-Control-Allow-Origin");
		this.headers.set("Access-Control-Allow-Origin", (accessControlAllowOrigin ? `${this.headers.get("Access-Control-Allow-Origin")}, ` : "") + origin);
		return this;
	}
	
	allowMethod(method: string) {
		let accessControlAllowMethods = this.headers.has("Access-Control-Allow-Methods");
		this.headers.set("Access-Control-Allow-Methods", (accessControlAllowMethods ? `${this.headers.get("Access-Control-Allow-Methods")}, ` : "") + method);
		return this;
	}
	
	allowHeader(header: string) {
		let accessControlAllowHeaders = this.headers.has("Access-Control-Allow-Headers");
		this.headers.set("Access-Control-Allow-Headers", (accessControlAllowHeaders ? `${this.headers.get("Access-Control-Allow-Headers")}, ` : "") + header);
		return this;
	}
}

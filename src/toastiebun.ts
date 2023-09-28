export namespace toastiebun {

	/**
	 * 
	 */
	export const pathLike = /([a-zA-Z0-9]|[\/+-_.]|\%[0-9a-fA-F][0-9a-fA-F])+/;
	export const URILike = /([a-zA-Z0-9]|[\/+-_.*]|\%[0-9a-fA-F][0-9a-fA-F])+/;

	export type path = string;
	
	export type method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "TRACE" | "CONNECT" | "*" | "MIDDLEWARE";
	
	export type handlerFunction = (req: request, res: response, next?: () => void) => void;
	
	export type handleDescriptor = {
		path: path,
		method: method,
		handler: handlerFunction | server
	};

	export type httpFrame = {
		status: number,
		headers: {
			[key: string]: string
		},
		body: any;
	}

	export interface server {
		use: (path: string | string[] | server, middleware?: server) => this
	}

	export interface request {
		app: server;
		method: method;
		path: string;
		routeTrace: () => string[]
	}

	export interface response {
		readonly app: server;
		send: (body: any) => boolean;
		sendFile: (path: string) => boolean;
	}
}
import server from "./server";

export namespace toastiebun {
	type path = string;
	type method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "TRACE" | "CONNECT" | "*" | "MIDDLEWARE";
	type handler = (req: request, res: response, next?: () => void) => void;
	type handleDescriptor = {
		path: path,
		method: method,
		handle: handler | server
	};
	type httpFrame = {
		status: number,
		headers: {
			[key: string]: string
		},
		body: any;
	}
}

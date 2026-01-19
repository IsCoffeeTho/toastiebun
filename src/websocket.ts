import { EventEmitter } from "events";
import { ServerWebSocket } from "bun";

interface websocketEvents {
		data: [Buffer];
		close: [number, string];
		error: [Error];
	}

export default class websocket {
	#ev: EventEmitter;
	#ws: ServerWebSocket<unknown> | null;
	constructor() {
		this.#ev = new EventEmitter<websocketEvents>();
		this.#ws = null;
	}

	set baseWS(ws: ServerWebSocket<unknown>) {
		if (!this.#ws) this.#ws = ws;
	}

	on<ev extends keyof websocketEvents>(event: ev, fn: (...args: websocketEvents[ev]) => any) {
		return this.#ev.on(event, fn);
	}
	once<ev extends keyof websocketEvents>(event: ev, fn: (...args: websocketEvents[ev]) => any) {
		return this.#ev.once(event, fn);
	}
	emit<ev extends keyof websocketEvents>(event: ev, ...args: websocketEvents[ev]) {
		return this.#ev.emit(event, ...args);
	}

	send(m: string | Bun.BufferSource, compressed = false): boolean {
		if (!this.#ws) return false;
		this.#ws.send(m, compressed);
		return true;
	}

	read(): Promise<Buffer<ArrayBufferLike>> {
		return new Promise((res, rej) => {
			if (!this.#ws) res(Buffer.alloc(0));
			this.once("data", buf => {
				res(buf);
			});
		});
	}

	close(): void;
	close(reason?: string): void;
	close(code?: number): void;
	close(code?: number, reason?: string): void;
	close(code_or_reason?: number | string, reason?: string) {
		var code: number | undefined = undefined;
		if (typeof code_or_reason == "number") {
			code = code_or_reason;
		} else if (typeof code_or_reason == "string") {
			reason = code_or_reason;
		}
		this.#ws?.close(code, reason);
	}
}

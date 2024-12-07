import { EventEmitter } from "stream";
import { ServerWebSocket } from "bun";
import { toastiebun } from "./toastiebun.d";

type websocketEventHandler = {
	on: toastiebun.eventHandler<toastiebun.websocketEvents>,
	once: toastiebun.eventHandler<toastiebun.websocketEvents>,
	emit: toastiebun.eventHandler<toastiebun.websocketEvents>
}

export default class websocket implements websocketEventHandler {
	#ev: EventEmitter;
	#ws: ServerWebSocket<unknown> | null;
	constructor() {
		this.#ev = new EventEmitter();
		this.#ws = null;
	}

	set baseWS(ws: ServerWebSocket<unknown>) {
		if (!this.#ws)
			this.#ws = ws;
	}
	

	on(event: string, fn: (...args: any[]) => any) { return this.#ev.on(event, fn); }
	once(event: string, fn: (...args: any[]) => any) { return this.#ev.once(event, fn); }
	emit(event: string, ...args: any[]) { return this.#ev.emit(event, ...args); }

	send(m: string | Bun.BufferSource, compressed = false): boolean {
		if (!this.#ws)
			return false;
		this.#ws.send(m, compressed);
		return true;
	}

	close(): void;
	close(reason?: string): void;
	close(code?: number): void;
	close(code?: number, reason?: string): void;
	close(code_or_reason?: number | string, reason?: string) {
		var code: number | undefined = undefined;
		if (typeof code_or_reason == "number") {
			code = code_or_reason
		} else if (typeof code_or_reason == "string") {
			reason = code_or_reason;
		}
		this.#ws?.close(code, reason);
	}
}
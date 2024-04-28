import { EventEmitter } from "stream";
import { toastiebun } from "./toastiebun";
import { ServerWebSocket } from "bun";

export default class websocket implements toastiebun.websocket {
	#ev: EventEmitter;
	#ws: ServerWebSocket | null;
	constructor() {
		this.#ev = new EventEmitter();
		this.#ws = null;
	}

	set baseWS(ws: ServerWebSocket) {
		if (!this.#ws)
			this.#ws = ws;
	}

	on(event:string, fn:(...args:any[]) => any) { this.#ev.on(event, fn); }
	once(event:string, fn:(...args:any[]) => any) { this.#ev.once(event, fn); }
	emit(event:string, ...args:any[]) { this.#ev.emit(event, ...args); }

	send(m:string|Buffer|Uint8Array, compressed=false):boolean {
		if (!this.#ws)
			return false;
		this.#ws.send(m, compressed);
		return true;
	}
}
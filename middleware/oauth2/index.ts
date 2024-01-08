import toastiebun from "../../.";

export default class oauth2 {
	constructor(options : {
		subPath?: string
	}) {
		if (options) {

		}
	}

	

	asServer() {
		return new toastiebun.server()
			.get("", () => {

			});
	}
}
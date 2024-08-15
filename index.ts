import server from "./src/server";
import response from "./src/response";
import request from "./src/request";
import oauth2 from "./middleware/oauth2";

export default {
	server,
	request,
	response,
	oauth2
};
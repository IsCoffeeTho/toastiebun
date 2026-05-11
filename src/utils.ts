export class ToastiebunError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
	}
}

export const MIMETypeOfExt = (type: string): string => {
	switch (type) {
		case "html":
		case "htm":
			return "text/html";
		case "css":
		case "style":
		case "stylesheet":
			return "text/css";
		case "txt":
		case "text":
			return "text/plain";
		case "js":
		case "javascript":
			return "text/javascript";
		case "json":
			return "application/json";
		case "jpeg":
		case "jpg":
			return "image/jpeg";
		case "png":
			return "image/png";
		case "gif":
			return "image/gif";
		case "svg":
			return "image/svg+xml";
		case "webp":
			return "image/webp";
		case "mp3":
			return "audio/mpeg";
		case "oga":
			return "audio/ogg";
		case "wav":
			return "audio/wav";
		case "mp4":
			return "video/mp4";
		case "webm":
			return "video/webm";
		case "ogv":
			return "video/ogg";
		case "xml":
			return "application/xml";
		case "atom":
			return "application/atom+xml";
		case "xhtml":
			return "application/xhtml+xml";
		case "js":
			return "application/javascript";
		case "webmanifest":
			return "application/manifest+json";
		case "eot":
			return "application/vnd.ms-fontobject";
		case "woff":
			return "application/font-woff";
		case "woff2":
			return "application/font-woff2";
		case "ttf":
			return "application/x-font-ttf";
		case "js":
			return "application/x-javascript";
		case "pdf":
			return "application/pdf";
		case "csv":
			return "text/csv";
		case "xml":
			return "text/xml";
		case "form":
			return "application/x-www-form-urlencoded";
		case "zip":
			return "application/x-zip-compressed";
		case "zip":
			return "application/zip";
		case "ico":
			return "image/x-icon";
		case "swf":
			return "application/x-shockwave-flash";
		case "rar":
			return "application/x-rar-compressed";
		case "tar":
			return "application/x-tar";
		case "eml":
			return "message/rfc822";
		case "ogx":
			return "application/ogg";
		case "avi":
			return "video/x-msvideo";
		case "wmv":
			return "video/x-ms-wmv";
		case "7z":
			return "application/x-7z-compressed";
		case "bz":
			return "application/x-bzip";
		case "bz2":
			return "application/x-bzip2";
		case "aif":
		case "aiff":
		case "aifc":
			return "audio/x-aiff";
		case "flac":
			return "audio/x-flac";
		case "bmp":
			return "image/bmp";
		case "tiff":
		case "tif":
			return "image/tiff";
		case "xls":
			return "application/vnd.ms-excel";
		case "doc":
			return "application/vnd.ms-word";
		case "ppt":
			return "application/vnd.ms-powerpoint";
		case "docx":
			return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
		case "xlsx":
			return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
		case "pptx":
			return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
		case "epub":
			return "application/epub+zip";
		case "msi":
			return "application/x-msi";
		case "exe":
			return "application/x-dosexec";
		case "jar":
			return "application/x-java-archive";
		case "pem":
			return "application/x-pem-file";
		case "p12":
		case "pfx":
			return "application/x-pkcs12";
		case "p7b":
		case "spc":
			return "application/x-pkcs7-certificates";
		case "p7r":
			return "application/x-pkcs7-certreqresp";
		case "woff":
			return "application/x-font-woff";
		case "woff2":
			return "application/x-font-woff2";
		case "mid":
		case "midi":
			return "audio/midi";
		case "ra":
			return "audio/vnd.rn-realaudio";
		case "obj":
			return "model/obj";
		case "igs":
		case "iges":
			return "model/iges";
		case "sh":
			return "application/x-sh";
		case "csh":
			return "application/x-csh";
		case "rb":
			return "application/x-ruby";
		case "pl":
			return "application/x-perl";
		case "mdb":
			return "application/x-ms-access";
		case "exe":
			return "application/x-ms-dos-executable";
		case "tar.gz":
		case "tgz":
			return "application/x-compressed";
		case "xz":
			return "application/x-xz";
		case "lz":
			return "application/x-lzip";
		case "lzma":
			return "application/x-lzma";
		case "xar":
			return "application/x-xar";
		case "sit":
			return "application/x-stuffit";
		case "odt":
			return "application/vnd.oasis.opendocument.text";
		case "ods":
			return "application/vnd.oasis.opendocument.spreadsheet";
		case "odg":
			return "application/vnd.oasis.opendocument.drawings";
		case "odg":
			return "application/vnd.oasis.opendocument.graphics";
		case "odc":
			return "application/vnd.oasis.opendocument.chart";
		case "odf":
			return "application/vnd.oasis.opendocument.formula";
		case "bin":
		case "exe":
		case "dll":
		case "class":
		default:
			return "application/octet-stream";
	}
};

export const pathLike: RegExp = /^([a-zA-Z0-9]|[\/+-_.]|\%[0-9a-fA-F][0-9a-fA-F])+$/;
export const pathPatternLike: RegExp = /^(([a-zA-Z0-9]|[\/+-_.]|\%[0-9a-fA-F][0-9a-fA-F])+\*{0,1}|\*)$/;

export enum HTTPStatus {
	// Informational responses (100–199)
	CONTINUE = 100,
	SWITCHING_PROTOCOLS = 101,
	PROCESSING = 102,
	EARLY_HINTS = 103,

	// Successful responses (200–299)
	OK = 200,
	CREATED = 201,
	ACCEPTED = 202,
	NON_AUTHORITATIVE_INFORMATION = 203,
	NO_CONTENT = 204,
	RESET_CONTENT = 205,
	PARTIAL_CONTENT = 206,
	MULTI_STATUS = 207,
	ALREADY_REPORTED = 208,
	IM_USED = 226,

	// Redirection messages (300–399)
	MULTIPLE_CHOICES = 300,
	MOVED_PERMANENTLY = 301,
	FOUND = 302,
	SEE_OTHER = 303,
	NOT_MODIFIED = 304,
	USE_PROXY = 305,
	TEMPORARY_REDIRECT = 307,
	PERMANENT_REDIRECT = 308,

	// Client error responses (400–499)
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	PAYMENT_REQUIRED = 402,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	METHOD_NOT_ALLOWED = 405,
	NOT_ACCEPTABLE = 406,
	PROXY_AUTHENTICATION_REQUIRED = 407,
	REQUEST_TIMEOUT = 408,
	CONFLICT = 409,
	GONE = 410,
	LENGTH_REQUIRED = 411,
	PRECONDITION_FAILED = 412,
	PAYLOAD_TOO_LARGE = 413,
	URI_TOO_LONG = 414,
	UNSUPPORTED_MEDIA_TYPE = 415,
	RANGE_NOT_SATISFIABLE = 416,
	EXPECTATION_FAILED = 417,
	I_M_A_TEAPOT = 418,
	MISDIRECTED_REQUEST = 421,
	UNPROCESSABLE_ENTITY = 422,
	LOCKED = 423,
	FAILED_DEPENDENCY = 424,
	TOO_EARLY = 425,
	UPGRADE_REQUIRED = 426,
	PRECONDITION_REQUIRED = 428,
	TOO_MANY_REQUESTS = 429,
	REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
	UNAVAILABLE_FOR_LEGAL_REASONS = 451,

	// Server error responses (500–599)
	INTERNAL_SERVER_ERROR = 500,
	NOT_IMPLEMENTED = 501,
	BAD_GATEWAY = 502,
	SERVICE_UNAVAILABLE = 503,
	GATEWAY_TIMEOUT = 504,
	HTTP_VERSION_NOT_SUPPORTED = 505,
	VARIANT_ALSO_NEGOTIATES = 506,
	INSUFFICIENT_STORAGE = 507,
	LOOP_DETECTED = 508,
	NOT_EXTENDED = 510,
	NETWORK_AUTHENTICATION_REQUIRED = 511,
}

export type method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export type CORSOptions = {
	origins?: string[],
	allowHeaders?: string[],
	exposeHeaders?: string[],
	maxAge?: number,
	allowCredentials?: boolean,
};

export type cookieOptions = {
	domain?: string;
	expires?: Date;
	httpOnly?: boolean;
	maxAge?: Number;
	path?: string;
	sameSite?: boolean | "Strict" | "Lax" | "None";
	secure?: boolean;
};

export type cookie = {
	value: string;
} & cookieOptions;

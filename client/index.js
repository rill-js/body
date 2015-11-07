var bytes        = require("bytes");
var ignoreMethod = {
	GET: true,
	HEAD: true,
	DELETE: true
};

module.exports = function (opts) {
	// Apply default options.
	opts            = opts || {};
	opts.encoding   = "encoding" in opts ? opts.encoding : "utf-8";
	opts.strict     = "strict" in opts ? opts.strict : true;
	opts.fieldLimit = "fieldLimit" in opts ? opts.fieldLimit : 1000;
	opts.limit      = "limit" in opts ? opts.limit : "2mb";

	if (typeof opts.limit === "string") {
		opts.limit = bytes(opts.limit);
	}

	return function parseBody (ctx, next) {
		var req    = ctx.req;
		var method = req.method.toUpperCase();

		if (opts.strict && ignoreMethod[method]) {
			req.body  = {};
			req.files = {};
			return next();
		}

		req.body  = req.original.body || {};
		req.files = req.original.files || {};

		return next();
	};
};
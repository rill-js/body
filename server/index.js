var fs           = require("fs");
var os           = require("os");
var bytes        = require("bytes");
var qSet         = require("q-set");
var IncomingForm = require("formidable").IncomingForm;
var File         = require("formidable/lib/file");
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

		return parse(req, opts).then(next);
	};
};

/**
 * Parse a request body using formidable.
 */
function parse (req, opts) {
	var form  = new IncomingForm();
	var body  = {};
	var files = {};

	// Formidable options.
	form.type           = opts.encoding;
	form.maxFields      = opts.fieldLimit;
	form.maxFieldSize   = opts.limit;
	form.keepExtensions = false;
	form.multiples      = true;

	return new Promise(function (accept, reject) {
		form
		.on("end", function () {
			req.body  = body;
			req.files = files;
			form.removeAllListeners();
			accept();
		})
		.on("error", reject)
		.on("field", function (field, value) {
			qSet(body, field, value);
		})
		.on("file",  function (field, file) {
			// Clean up files after the request.
			file._writeStream.once("close", function () { if (!file._readStream) fs.unlink(file.path) });
			file.lastModified = Number(file.lastModifiedDate);
			qSet(files, field, file);
		})
		.parse(req.original);
	});
}

/**
 * Make the formidable file api a bit more isomorphic.
 */
File.prototype.toJSON = function () {
	return {
		size:             this.size,
		name:             this.name,
		type:             this.type,
		lastModifiedDate: this.lastModifiedDate
	};
};

/**
 * Allow copying files as read streams.
 */
File.prototype.pipe = function (data) {
	if (!this._readStream) {
		var path  = this.path;
		var write = this._writeStream;
		var read  = this._readStream = fs.createReadStream(path);
		read.pause();
		read.once("close", function () { fs.unlink(path); })
		write.once("close", function () { read.resume(); });
	}

	return this._readStream.pipe(data);
};
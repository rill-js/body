'use strict'

var fs = require('fs')
var bytes = require('bytes')
var qSet = require('q-set')
var fSet = qSet.flat
var IncomingForm = require('formidable').IncomingForm
var File = require('formidable/lib/file')
var ignoreMethod = {
  GET: true,
  HEAD: true,
  DELETE: true
}

module.exports = function (opts) {
  // Apply default options.
  opts = opts || {}
  opts.encoding = 'encoding' in opts ? opts.encoding : 'utf-8'
  opts.strict = 'strict' in opts ? opts.strict : true
  opts.fieldLimit = 'fieldLimit' in opts ? opts.fieldLimit : 1000
  opts.limit = 'limit' in opts ? opts.limit : '2mb'

  if (typeof opts.limit === 'string') {
    opts.limit = bytes(opts.limit)
  }

  return function parseBody (ctx, next) {
    var req = ctx.req
    var method = req.method.toUpperCase()

    if (req.body || req.files) return next()
    if (opts.strict && ignoreMethod[method]) {
      req.body = {}
      req.files = {}
      return next()
    }

    return parse(req, opts).then(next)
  }
}

/**
 * Parse a request body using formidable.
 */
function parse (req, opts) {
  var set = opts.flat ? fSet : qSet
  var form = new IncomingForm()
  var body = {}
  var files = {}

  // Formidable options.
  form.type = opts.encoding
  form.maxFields = opts.fieldLimit
  form.maxFieldSize = opts.limit
  form.keepExtensions = false
  form.multiples = true

  return new Promise(function (resolve, reject) {
    form
      .on('end', function () {
        req.body = body
        req.files = files
        form.removeAllListeners()
        resolve()
      })
      .on('error', reject)
      .on('field', function (field, value) {
        set(body, field, value)
      })
      .on('file', function (field, file) {
        // Clean up files after the request.
        var path = file.path
        var read = fs.createReadStream(path)
        read.once('end', function () { fs.unlink(path) })
        file.pipe = read.pipe.bind(read)
        file.lastModifiedDate = new Date(file.lastModifiedDate)
        set(files, field, file)
      })
      .parse(req.original)
  })
}

/**
 * Make the formidable file api a bit more isomorphic.
 */
File.prototype.toJSON = function () {
  return {
    size: this.size,
    name: this.name,
    type: this.type,
    lastModifiedDate: this.lastModifiedDate
  }
}

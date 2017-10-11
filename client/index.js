// @ts-check
/** Type Definitions */
/** @module rill/body */
/**
 * @typedef {object} Options
 * @property {string} [encoding='utf-8']
 * @property {boolean} [strict=true]
 * @property {boolean} [flat=false]
 * @property {number} [fieldLimit=1000]
 * @property {string|number} [limit='2mb']
 * @property {function} [transformField]
 * @property {function} [transformFile]
 */
'use strict'

var qSet = require('q-set')
var bytes = require('bytes')
var ignoreMethod = {
  GET: true,
  HEAD: true,
  DELETE: true
}

/**
 * Creates a Rill middleware which will parse the request body and attach to `req.body` and `req.files`.
 *
 * @param {Options} opts - The middleware options.
 * @return {(ctx: rill.Context, next: function) => Promise}
 */
module.exports = function (opts) {
  // Apply default options.
  opts = opts || {}
  opts.encoding = 'encoding' in opts ? opts.encoding : 'utf-8'
  opts.strict = 'strict' in opts ? opts.strict : true
  opts.flat = 'flat' in opts ? opts.flat : false
  opts.fieldLimit = 'fieldLimit' in opts ? opts.fieldLimit : 1000
  opts.limit = 'limit' in opts ? opts.limit : '2mb'

  if (typeof opts.limit === 'string') {
    opts.limit = bytes(opts.limit)
  }

  return function parseBody (ctx, next) {
    var key
    var req = ctx.req
    var original = req.original
    var options = original._options
    var method = req.method.toUpperCase()

    if (req.body || req.files) return next()
    if (opts.strict && ignoreMethod[method]) {
      req.body = {}
      req.files = {}
      return next()
    }

    var body = req.body = options.body || original.body || {}
    var files = req.files = options.files || original.files || {}

    // Run all body fields through a transform if needed.
    if (typeof opts.transformField === 'function') {
      for (key in body) body[key] = opts.transformField(key, body[key])
    }

    // Run all file fields through a transform if needed.
    if (typeof opts.transformFile === 'function') {
      for (key in files) files[key] = opts.transformFile(key, files[key])
    }

    // Use qSet to unflatten the body and files.
    if (!opts.flat) {
      req.body = {}
      req.files = {}
      // Unflatten body keys.
      for (key in body) qSet(req.body, key, body[key])
      // Unflatten file keys.
      for (key in files) qSet(req.files, key, files[key])
    }

    return next()
  }
}

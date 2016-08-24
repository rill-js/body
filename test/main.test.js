var path = require('path')
var assert = require('assert')
var Rill = require('rill')
var agent = require('supertest')
var bodyParser = require('../server')

describe('Rill/Body', function () {
  it('should work on the server', function (done) {
    var request = agent(Rill()
      .use(bodyParser({ uploadDir: __dirname }))
      .post('/', respond(200, function (ctx, next) {
        var req = ctx.req
        var body = req.body
        var files = req.files
        assert.deepEqual(body, { a: { b: { c: '1' } } })
        assert.equal(typeof body.a.b.c, 'string')
        assert('test' in files)
      })).listen())

    request
      .post('/')
      .expect(200)
      .type('form')
      .attach('test', path.join(__dirname, '/main.test.js'), 'main.test.js')
      .field('a[b][c]', '1')
      .end(done)
  })

  it('should transform values', function (done) {
    var request = agent(Rill()
      .use(bodyParser({ uploadDir: __dirname, transformField: transformNumbers }))
      .post('/', respond(200, function (ctx, next) {
        var req = ctx.req
        var body = req.body
        var files = req.files
        assert.deepEqual(body, { a: { b: { c: 1, d: 'hi' } } })
        assert.equal(typeof body.a.b.c, 'number')
        assert('test' in files)
      })).listen())

    request
      .post('/')
      .expect(200)
      .type('form')
      .attach('test', path.join(__dirname, '/main.test.js'), 'main.test.js')
      .field('a[b][c]', '1')
      .field('a[b][d]', 'hi')
      .end(done)
  })

  function transformNumbers (field, value) {
    if (field === 'a[b][c]') return Number(value)
    return value
  }
})

function respond (status, test) {
  return function (ctx) {
    ctx.res.status = status
    if (typeof test === 'function') test(ctx)
  }
}

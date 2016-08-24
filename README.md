<h1 align="center">
  <!-- Logo -->
  <img src="https://raw.githubusercontent.com/rill-js/rill/master/Rill-Icon.jpg" alt="Rill"/>
  <br/>
  @rill/body
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-brightgreen.svg?style=flat-square" alt="API stability"/>
  </a>
  <!-- Standard -->
  <a href="https://github.com/feross/standard">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square" alt="Standard"/>
  </a>
  <!-- NPM version -->
  <a href="https://npmjs.org/package/@rill/body">
    <img src="https://img.shields.io/npm/v/@rill/body.svg?style=flat-square" alt="NPM version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/@rill/body">
    <img src="https://img.shields.io/npm/dm/@rill/body.svg?style=flat-square" alt="Downloads"/>
  </a>
  <!-- Gitter Chat -->
  <a href="https://gitter.im/rill-js/rill">
    <img src="https://img.shields.io/gitter/room/rill-js/rill.svg?style=flat-square" alt="Gitter Chat"/>
  </a>
</h1>

Isomorphic request body parser for Rill.
Uses [formidable](http://github.com/felixge/node-formidable) to parse form data.

# Installation

```console
npm install @rill/body
```

# Example

```javascript
const app = require("rill")()
const bodyParser = require("@rill/body")

app.use(bodyParser())
app.use(function ({ req, res }, next) {
	req.body // Object containing parsed form fields.
	req.files // Object of form fields with files.
})
```

# API Options / Defaults.

```javascript
{
	// Form encoding.
	encoding: "utf-8",
	// Max size (in bytes) for forms.
	limit: "2mb",
	// Max number of fields (0 for unlimited).
	limitFields: 1000,
	// Ignore form data parsing on GET, HEAD and DELETE requests.
	strict: true,
	// When flat is false fields such as a[b][c] won't be expanded.
	flat: false,
	// A function that can modify all fields parsed.
	transformField: (field, value)=> ...,
	// A function that can modify all files parsed.
	transformFile: (field, file)=> ...,
}
```


### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!

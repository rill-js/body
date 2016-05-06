[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Chat about Rill at https://gitter.im/rill-js/rill](https://badges.gitter.im/rill-js/rill.svg)](https://gitter.im/rill-js/rill?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Rill Body
Isomorphic form data parser for Rill.

# Installation

#### Npm
```console
npm install @rill/body
```

# Example

```javascript
const app        = require("rill")();
const bodyParser = require("@rill/body");

app.use(bodyParser());
app.use(function ({ req, res }, next) {
	req.body; // Object containing parsed form fields.
	req.files; // Object of form fields with files.
});
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

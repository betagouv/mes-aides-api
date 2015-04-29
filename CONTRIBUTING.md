Build
-----

Build processes are automated through [npm scripts](https://www.npmjs.org/doc/cli/npm-run-script.html).
All Node developer dependencies can be installed with:

	cd path/to/repository/clone
	npm install

The following commands will then be available.


### Tests

Test runner: [Mocha](http://visionmedia.github.com/mocha/). Assertion library: [`should`](https://github.com/tj/should.js).

	npm test

The main application code is written in JavaScript, but tests are written in [CoffeeScript](http://coffeescript.org).

> Why CoffeeScript? Well, good tests are very short and give context through `describe`, which quickly leads to deep nesting.
> We simply don't want our test code to have more `function()` and `({ });` than actual code.
> For this specific use case, CoffeeScript does a better job at readability than JavaScript does.

You can execute a subset of tests only if you're working on a specific part. For example, considering you're adding tests to the mapping:

	[node_modules/.bin/]mocha test [--watch] test/openfisca/mapping

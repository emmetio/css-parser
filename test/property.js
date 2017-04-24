'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
require('babel-register');
const parse = require('../index').default;

describe('Property Fragments', () => {
	const parseProperty = prop => parse(prop).firstChild;
	it('should parse simple property', () => {
		const prop = parseProperty('padding: 10px 20% ;');

		assert.equal(prop.name, 'padding');

		assert.equal(prop.value, '10px 20%');
		assert.equal(prop.valueToken.type, 'fragments');

		const f = prop.valueToken.fragments;
		assert.equal(f[0].type, 'fragments');
		assert.equal(f[0].fragments[0].type, 'number');
		assert.equal(f[0].fragments[0].number.valueOf(), '10');
		assert.equal(f[0].fragments[0].unit.valueOf(), 'px');

		assert.equal(f[0].fragments[1].type, 'whitespace');

		assert.equal(f[0].fragments[2].type, 'number');
		assert.equal(f[0].fragments[2].number.valueOf(), '20');
		assert.equal(f[0].fragments[2].unit.valueOf(), '%');
	});

	it('should parse URL', () => {
		const prop = parseProperty('background:url(http://example.com/image.jpg)');

		assert.equal(prop.name, 'background');
		assert.equal(prop.value, 'url(http://example.com/image.jpg)');

		const url = prop.valueToken.fragments[0].fragments[0];

		assert.equal(url.type, 'url');
		assert.equal(url.valueOf(), 'url(http://example.com/image.jpg)');
		assert.equal(url.value.valueOf(), 'http://example.com/image.jpg');
	});

	it('should parse multiple values', () => {
		const prop = parseProperty('foo: rgb(1, 2, 3), 10px, bar(baz())');

		assert.equal(prop.name, 'foo');
		assert.equal(prop.value, 'rgb(1, 2, 3), 10px, bar(baz())');

		const parts = prop.valueToken.fragments;

		assert(parts[0].fragments[0].type, 'function');
		assert(parts[0].fragments[0].name.valueOf(), 'rgb');
		assert(parts[0].fragments[0].arguments.list.length, 3);
		assert(parts[0].fragments[0].arguments.list[0].valueOf(), '1');
		assert(parts[0].fragments[0].arguments.list[1].valueOf(), '2');
		assert(parts[0].fragments[0].arguments.list[2].valueOf(), '3');

		assert(parts[1].fragments[0].type, 'number');
		assert(parts[1].fragments[0].number.valueOf(), '10');
		assert(parts[1].fragments[0].unit.valueOf(), 'px');

		assert(parts[2].fragments[0].type, 'function');
		assert(parts[2].fragments[0].name.valueOf(), 'bar');
		assert(parts[2].fragments[0].arguments.list.length, 1);

		const innerFn = parts[2].fragments[0].arguments.list[0].fragments[0];
		assert(innerFn.type, 'function');
		assert(innerFn.name.valueOf(), 'baz');
		assert(innerFn.valueOf(), 'baz()');
	});
});

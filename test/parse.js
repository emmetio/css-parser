'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
require('babel-register');
const parse = require('../lib/parser').default;

describe('CSS Parser', () => {
	const readFile = file => fs.readFileSync(path.resolve(__dirname, file), 'utf8');

	it('should parse properties', () => {
		const model = parse(readFile('./fixtures/properties.css'));
		let node;

		assert.equal(model.children.length, 5);

		node = model.children[0];
		assert.equal(node.name, '@a');
		assert.equal(node.value, '10');
		assert.equal(node.terminator, ';');

		node = model.children[1];
		assert.equal(node.name, '$bc');
		assert.equal(node.value, 'foo');
		assert.equal(node.terminator, ';');
		assert.equal(node.type, 'property');

		node = model.children[2];
		assert.equal(node.name, '@import');
		assert.equal(node.value, '"url"');
		assert.equal(node.terminator, ';');
		assert.equal(node.type, 'property');

		node = model.children[3];
		assert.equal(node.name, '@import');
		assert.equal(node.value, '"a", "b"');
		assert.equal(node.terminator, ';');
		assert.equal(node.type, 'property');

		node = model.children[4];
		assert.equal(node.name, '@import');
		assert.equal(node.value, 'url("foo bar")');
		assert.equal(node.terminator, undefined);
		assert.equal(node.type, 'property');
	});

	it('should parse sections', () => {
		const model = parse(readFile('./fixtures/sections.css'));
		let node;

		assert.equal(model.children.length, 3);

		node = model.children[0];
		assert.equal(node.type, 'rule');
		assert.equal(node.name, 'body');
		assert.equal(node.children.length, 2);

		assert.equal(node.children[0].type, 'property');
		assert.equal(node.children[0].name, 'padding');
		assert.equal(node.children[0].value, '10px');

		assert.equal(node.children[1].type, 'rule');
		assert.equal(node.children[1].name, '&:hover &::before');

		node = model.children[1];
		assert.equal(node.type, 'at-rule');
		assert.equal(node.name, '@media');
		assert.equal(node.expressions.length, 1);
		assert.equal(node.expressions[0].type, 'fragments');
		assert.equal(node.expressions[0].valueOf(), 'print');
		assert.equal(node.children.length, 1);

		assert.equal(node.children[0].type, 'rule');
		assert.equal(node.children[0].name, 'a[foo="b:a;r"]::before');
		assert.equal(node.children[0].children.length, 1);

		// test complex selector with LESS-style mixins
		node = node.children[0].firstChild;
		assert.equal(node.type, 'rule');
		assert.equal(node.name, '::slotted(.foo)');
		assert.equal(node.children.length, 3);

		assert.equal(node.children[0].type, 'property');
		assert.equal(node.children[0].name, '.foo.bar');
		assert.equal(node.children[0].value, null);

		assert.equal(node.children[1].type, 'property');
		assert.equal(node.children[1].name, 'a');
		assert.equal(node.children[1].value, 'b');

		assert.equal(node.children[2].type, 'property');
		assert.equal(node.children[2].name, '#baz.bar');
		assert.equal(node.children[2].value, null);

		// test multiline sector
		node = model.children[2];
		assert.equal(node.type, 'rule');
		assert.equal(node.name, '.foo,\n#bar');
		assert.equal(node.children.length, 1);

		assert.equal(node.children[0].type, 'property');
		assert.equal(node.children[0].name, 'margin');
		assert.equal(node.children[0].value, 'auto');
	});

	it('should handle comments', () => {
		const model = parse(readFile('./fixtures/comments.scss'));
		let node;

		assert.equal(model.children.length, 1);

		node = model.firstChild;
		assert.equal(node.type, 'rule');
		assert.equal(node.name, 'foo /* a:b; */, bar');
		assert.equal(node.children.length, 1);

		node = node.firstChild;
		assert.equal(node.type, 'rule');
		assert.equal(node.name, 'a, // c:b {}\n\tb');
		assert.equal(node.children.length, 1);

		node = node.firstChild;
		assert.equal(node.type, 'property');
		assert.equal(node.name, 'padding');
		assert.equal(node.value, '0');
	});
});

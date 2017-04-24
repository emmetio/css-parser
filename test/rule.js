'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
require('babel-register');
const parse = require('../index').default;

describe('Rule Fragments', () => {
	const parseRule = sel => parse(sel).firstChild;

	it('should consume single selector', () => {
		const rule = parseRule('  div.class1.class2#id { } ');

		assert.equal(rule.start, 2);
		assert.equal(rule.end, 26);

		assert.equal(rule.name, 'div.class1.class2#id');
		assert.equal(rule.nameToken.start, 2);
		assert.equal(rule.nameToken.end, 22);
		assert.equal(rule.nameToken.fragments.length, 1);

		const selector = rule.nameToken.fragments[0];

		assert.equal(selector.valueOf(), 'div.class1.class2#id');
		assert.equal(selector.fragments.length, 4);

		const f = selector.fragments;
		assert.equal(f[0].type, 'ident');
		assert.equal(f[0].valueOf(), 'div');

		assert.equal(f[1].type, 'class');
		assert.equal(f[1].valueOf(), '.class1');
		assert.equal(f[1].name.valueOf(), 'class1');

		assert.equal(f[2].type, 'class');
		assert.equal(f[2].valueOf(), '.class2');
		assert.equal(f[2].name.valueOf(), 'class2');

		assert.equal(f[3].type, 'id');
		assert.equal(f[3].valueOf(), '#id');
		assert.equal(f[3].name.valueOf(), 'id');
	});

	it('should consume multiple selectors', () => {
		const rule = parseRule('a, [foo="bar,baz"], /* c */ .d { }');
		assert.equal(rule.name, 'a, [foo="bar,baz"], /* c */ .d');
		assert.equal(rule.nameToken.fragments.length, 3);

		let selector;

		selector = rule.nameToken.fragments[0];
		assert.equal(selector.valueOf(), 'a');
		assert.equal(selector.fragments.length, 1);

		selector = rule.nameToken.fragments[1];
		assert.equal(selector.valueOf(), '[foo="bar,baz"]');
		assert.equal(selector.fragments.length, 1);
		assert.equal(selector.fragments[0].type, 'attribute');
		assert.equal(selector.fragments[0].name.valueOf(), 'foo');
		assert.equal(selector.fragments[0].value.valueOf(), '"bar,baz"');
		assert.equal(selector.fragments[0].value.value.valueOf(), 'bar,baz');

		selector = rule.nameToken.fragments[2];
		assert.equal(selector.valueOf(), '.d');
		assert.equal(selector.fragments.length, 1);
	});

	it('should consume arguments', () => {
		const rule = parseRule('@media (min-width: 700px), handheld and (orientation: landscape) {  }');

		assert.equal(rule.name, '@media');
		assert.equal(rule.expressions.length, 2);

		let expr = rule.expressions[0];
		assert.equal(expr.type, 'fragments');
		assert.equal(expr.valueOf(), '(min-width: 700px)');
		assert.equal(expr.fragments[0].type, 'arguments');
		assert.equal(expr.fragments[0].list.length, 1);
		assert.equal(expr.fragments[0].list[0].valueOf(), 'min-width: 700px');

		expr = rule.expressions[1];
		assert.equal(expr.type, 'fragments');
		assert.equal(expr.valueOf(), 'handheld and (orientation: landscape)');
	});

	it('should consume pseudo-selectors', () => {
		const rule = parseRule('a:hover, b::before {  }');

		assert.equal(rule.name, 'a:hover, b::before');
		assert.equal(rule.nameToken.fragments.length, 2);

		let sel = rule.nameToken.fragments[0];
		assert.equal(sel.fragments.length, 2);
		assert.equal(sel.fragments[0].type, 'ident');
		assert.equal(sel.fragments[0].valueOf(), 'a');
		assert.equal(sel.fragments[1].type, 'pseudo');
		assert.equal(sel.fragments[1].valueOf(), ':hover');
		assert.equal(sel.fragments[1].name.valueOf(), 'hover');

		sel = rule.nameToken.fragments[1];
		assert.equal(sel.fragments.length, 2);
		assert.equal(sel.fragments[0].type, 'ident');
		assert.equal(sel.fragments[0].valueOf(), 'b');
		assert.equal(sel.fragments[1].type, 'pseudo');
		assert.equal(sel.fragments[1].valueOf(), '::before');
		assert.equal(sel.fragments[1].name.valueOf(), 'before');
	});
});

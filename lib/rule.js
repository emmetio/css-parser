'use strict';

import Token from './tokens/token';
import Node from './node';
import { last } from './utils';

/**
 * Creates CSS rule from given tokens
 * @param  {StreamReader} stream
 * @param  {Token[]} tokens
 * @param  {Token} [content]
 * @return {Rule}
 */
export default function createRule(stream, tokens, content) {
	if (!tokens.length) {
		return null;
	}

	let ix = 0;
	const name = tokens[ix++];

	if (name.type === 'at-keyword') {
		let expression;
		if (ix < tokens.length) {
			expression = tokens[ix++];
			expression.type = 'expression';
			expression.end = last(tokens).end;
		} else {
			expression = new Token(stream, 'expression', name.end, name.end);
		}

		return new AtRule(stream, name, expression, content);
	} else {
		name.end = last(tokens).end;
	}

	return new Rule(stream, name, content);
}

/**
 * Represents CSS rule
 * @type {Node}
 */
export class Rule extends Node {
	/**
	 * @param {StreamReader} stream
	 * @param {Token} name    Rule’s name token
	 * @param {Token} content Rule’s content token
	 */
	constructor(stream, name, content) {
		super('rule');
		this.stream = stream;
		this.selectorToken = name;
		this.contentToken = content;
	}

	/**
	 * Returns rule selector
	 * @return {String}
	 */
	get selector() {
		return valueOf(this.selectorToken);
	}

	/**
	 * Returns node’s start position in stream
	 * @return {*}
	 */
	get start() {
		return this.selectorToken && this.selectorToken.start;
	}

	/**
	 * Returns node’s end position in stream
	 * @return {*}
	 */
	get end() {
		const token = this.contentToken || this.nameToken;
		return token && token.end;
	}
}

export class AtRule extends Node {
	constructor(stream, name, expression, content) {
		super('at-rule');
		this.stream = stream;
		this.nameToken = name;
		this.expressionToken = expression;
		this.contentToken = content;
	}

	/**
	 * Returns at-rule name
	 * @return {String}
	 */
	get name() {
		return valueOf(this.nameToken && this.nameToken.item(0));
	}

	get expression() {
		return valueOf(this.expressionToken);
	}

	/**
	 * Returns node’s start position in stream
	 * @return {*}
	 */
	get start() {
		return this.nameToken && this.nameToken.start;
	}

	/**
	 * Returns node’s end position in stream
	 * @return {*}
	 */
	get end() {
		const token = this.contentToken || this.nameToken;
		return token && token.end;
	}
}

function valueOf(token) {
	return token && token.valueOf();
}

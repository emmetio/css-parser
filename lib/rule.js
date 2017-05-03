'use strict';

import Token from './tokens/token';
import consumeToken from './tokens/index';
import Node from './node';
import { last, isFormattingToken } from './utils';
import parseList from './list';

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
		this._parsedSelector = null;
	}

	/**
	 * Returns rule selector
	 * @return {String}
	 */
	get selector() {
		return valueOf(this.selectorToken);
	}

	get parsedSelector() {
		if (!this._parsedSelector) {
			this._parsedSelector = parseList(this.selectorToken.limit(), 'selector');
		}

		return this._parsedSelector;
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
		this._parsedExpression = null;
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

	get parsedExpression() {
		if (!this._parsedExpression) {
			this._parsedExpression = parseList(this.expressionToken.limit());
		}

		return this._parsedExpression;
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

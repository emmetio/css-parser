'use strict';

import Token from './tokens/token';
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
export class Rule {
	/**
	 * @param {StreamReader} stream
	 * @param {Token} name    Rule’s name token
	 * @param {Token} content Rule’s content token
	 */
	constructor(stream, name, content) {
		this.type = 'rule';
		this.stream = stream;
		this.nameToken = name;
		this.contentToken = content;

		this.children = [];
		this.parent = null;
	}

	/**
	 * Returns node name
	 * @return {String}
	 */
	get name() {
		return valueOf(this.nameToken);
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

	get firstChild() {
		return this.children[0];
	}

	get nextSibling() {
		const ix = this.getIndex();
		return ix !== -1 ? this.parent.children[ix + 1] : null;
	}

	get previousSibling() {
		const ix = this.getIndex();
		return ix !== -1 ? this.parent.children[ix - 1] : null;
	}

	/**
	 * Returns current element’s index in parent list of child nodes
	 * @return {Number}
	 */
	getIndex() {
		return this.parent ? this.parent.children.indexOf(this) : -1;
	}

	/**
	 * Adds given node as a child
	 * @param {Node} node
	 * @return {Node} Current node
	 */
	addChild(node) {
		if (node) {
			this.removeChild(node);
			this.children.push(node);
			node.parent = this;
		}
		return this;
	}

	/**
	 * Removes given node from current node’s child list
	 * @param  {Node} node
	 * @return {Node} Current node
	 */
	removeChild(node) {
		if (node && node.parent === this) {
			const ix = this.children.indexOf(node);
			if (ix !== -1) {
				this.children.splice(ix, 1);
				node.parent = null;
			}
		}

		return this;
	}
}

export class AtRule extends Rule {
	constructor(stream, name, expression, content) {
		super(stream, name, content);
		this.type = 'at-rule';
		this.expressionToken = expression;
	}

	get expressions() {
		return valueOf(this.expressionToken);
	}
}

function valueOf(token) {
	return token && token.valueOf();
}

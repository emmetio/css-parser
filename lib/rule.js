'use strict';

import { fragments } from './tokens/index';
import { PseudoToken } from './tokens/pseudo';
import { splitList, trimFormatting, commaSeparator } from './utils';

/**
 * Creates CSS rule frmo given tokens
 * @param  {StreamReader} stream
 * @param  {Token[]} tokens
 * @param  {Token} [contentStart]
 * @param  {Token} [contentEnd]
 * @return {Rule}
 */
export default function createRule(stream, tokens, contentStart, contentEnd) {
	tokens = replacePseudo(trimFormatting(tokens));

	if (!tokens.length) {
		return null;
	}

	if (tokens[0].type === 'at-keyword') {
		return new AtRule(tokens.shift(), createItemList(stream, tokens),
			contentStart, contentEnd);
	}

	return new Rule(createItemList(stream, tokens), contentStart, contentEnd);
}

/**
 * Represents CSS rule
 * @type {Node}
 */
export class Rule {
	/**
	 * @param  {Token} name         Rule name token
	 * @param  {Token} contentStart Rule’s content start token
	 * @param  {Token} [contentEnd] Rule’s content end token
	 */
	constructor(name, contentStart, contentEnd) {
		this.type = 'rule';
		this.nameToken = name;
		this.contentStart = contentStart;
		this.contentEnd = contentEnd;

		this.children = [];
		this.parent = null;
	}

	/**
	 * Returns node name
	 * @return {String}
	 */
	get name() {
		return this.nameToken && this.nameToken.valueOf();
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
		if (this.contentEnd) {
			return this.contentEnd.end;
		}
		return this.contentStart ? this.contentStart.end : this.nameToken.end;
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
		if (node) {
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
	constructor(name, expressions, contentStart, contentEnd) {
		super(name, contentStart, contentEnd);
		this.type = 'at-rule';
		this.expressionsToken = expressions;
	}

	get expressions() {
		return this.expressionsToken ? this.expressionsToken.fragments : [];
	}
}

/**
 * Replaces `:` separator and following ident token with pseudo token
 * @param  {StreamReader} stream
 * @param  {Token[]} tokens
 * @return {Token[]}
 */
function replacePseudo(tokens) {
	let result = [];
	let pseudoStart = [];

	for (let i = 0, il = tokens.length, token; i < il; i++) {
		token = tokens[i];
		if (token.propertyDelimiter) {
			pseudoStart.push(token);
		} else if (token.type === 'ident' && pseudoStart.length) {
			result.push(new PseudoToken(token, token.stream, pseudoStart[0].start, token.end));
			pseudoStart.length = 0;
		} else {
			if (pseudoStart.length) {
				result = result.concat(pseudoStart);
				pseudoStart.length = 0;
			}

			result.push(token);
		}
	}

	return result.concat(pseudoStart);
}

function createItemList(stream, tokens) {
	const items = splitList(tokens, commaSeparator)
		.map(item => fragments(stream, trimFormatting(item)));

	return fragments(stream, items);
}

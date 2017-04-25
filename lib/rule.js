'use strict';

import Range from './range';
import { trimFormatting, type } from './utils';

/**
 * Creates CSS rule frmo given tokens
 * @param  {StreamReader} stream
 * @param  {Token[]} tokens
 * @param  {Token} [content]
 * @return {Rule}
 */
export default function createRule(stream, tokens, content) {
	tokens = trimFormatting(tokens);

	if (!tokens.length) {
		return null;
	}

	if (type(tokens[0]) === 'at-keyword') {
		return new AtRule(stream,
			Range.fromObject(tokens.shift()),
			Range.fromObject(trimFormatting(tokens)),
			Range.fromObject(content)
		);
	}

	return new Rule(stream, Range.fromObject(tokens), Range.fromObject(content));
}

/**
 * Represents CSS rule
 * @type {Node}
 */
export class Rule {
	/**
	 * @param {StreamReader} stream
	 * @param {Range} name Rule’s name range
	 * @param {Range} content Rule’s content range
	 */
	constructor(stream, name, content) {
		this.type = 'rule';
		this.stream = stream;
		this.nameRange = name;
		this.contentRange = content;

		this.children = [];
		this.parent = null;
	}

	/**
	 * Returns node name
	 * @return {String}
	 */
	get name() {
		return valueOf(this.stream, this.nameRange);
	}

	/**
	 * Returns node’s start position in stream
	 * @return {*}
	 */
	get start() {
		return this.nameRange && this.nameRange.start;
	}

	/**
	 * Returns node’s end position in stream
	 * @return {*}
	 */
	get end() {
		const range = this.contentRange || this.nameRange;
		return range && range.end;
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
	constructor(stream, name, expressions, content) {
		super(stream, name, content);
		this.type = 'at-rule';
		this.expressionsRange = expressions;
	}

	get expressions() {
		return valueOf(this.stream, this.expressionsRange);
	}
}

function valueOf(stream, range) {
	return range && range.substring(stream);
}

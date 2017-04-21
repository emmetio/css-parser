'use strict';

/**
 * Represent CSS rule
 * @type {Node}
 */
export default class Rule {
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
		this.removeChild(node);
		this.children.push(node);
		node.parent = this;
		return this;
	}

	/**
	 * Removes given node from current node’s child list
	 * @param  {Node} node
	 * @return {Node} Current node
	 */
	removeChild(node) {
		const ix = this.children.indexOf(node);
		if (ix !== -1) {
			this.children.splice(ix, 1);
			node.parent = null;
		}

		return this;
	}
}

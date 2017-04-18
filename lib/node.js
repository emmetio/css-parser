'use strict';

/**
 * A node in basic CSS tree
 * @type {Node}
 */
export default class Node {
	/**
	 * @param  {String} type         Node type
	 * @param  {Token}  [name]       Name token
	 * @param  {Token}  [value]      Value token
	 * @param  {Token}  [terminator] Node terminator in source code
	 */
	constructor(type, name, value, terminator) {
		this.type = type;
		this._name = name;
		this._value = value;
		this._terminator = terminator;

		this.children = [];
		this.parent = null;
	}

	/**
	 * Returns node name
	 * @return {String}
	 */
	get name() {
		return this._name && this._name.valueOf();
	}

	/**
	 * Returns node value
	 * @return {String}
	 */
	get value() {
		return this._value && this._value.valueOf();
	}

	/**
	 * Returns node value
	 * @return {String}
	 */
	get terminator() {
		return this._terminator ? this._terminator.valueOf() : '';
	}

	/**
	 * Returns node’s start position in stream
	 * @return {*}
	 */
	get start() {
		return this.name && this.name.start;
	}

	/**
	 * Returns node’s end position in stream
	 * @return {*}
	 */
	get end() {
		if (this._terminator) {
			return this._terminator.end;
		}
		return this._value ? this._value.end : this._name && this._name.end;
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

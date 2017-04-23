'use strict';

import { Rule } from './rule';

export default class Stylesheet extends Rule {
	constructor() {
		super();
		this.type = 'stylesheet';
	}

	/**
	 * Returns node name
	 * @return {String}
	 */
	get name() {
		return null;
	}

	/**
	 * Returns node’s start position in stream
	 * @return {*}
	 */
	get start() {
		const node = this.children[0];
		return node && node.start;
	}

	/**
	 * Returns node’s end position in stream
	 * @return {*}
	 */
	get end() {
		const node = this.children[this.children.length - 1];
		return node && node.end;
	}
}

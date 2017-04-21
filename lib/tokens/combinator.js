'use strict';

import Token from './token';

const ADJACENT_SIBLING = 43;  // +
const GENERAL_SIBLING  = 126; // ~
const CHILD            = 62;  // >
const NESTING          = 38;  // &

/**
 * Consumes combinator token from given string
 */
export default function(stream) {
	if (isCombinator(stream.peek())) {
		const start = stream.pos;
		return new CombinatorToken(stream.next(), stream, start);
	}
}

function isCombinator(code) {
	return code === ADJACENT_SIBLING || code === GENERAL_SIBLING
		|| code === NESTING || code === CHILD;
}

export class CombinatorToken extends Token {
	constructor(code, stream, start, end) {
		super(stream, start, end);
		this.type = 'combinator';
		this.code = code;

		this.adjacentSibling = code === ADJACENT_SIBLING;
		this.generalSibling = code === GENERAL_SIBLING;
		this.child = code === CHILD;
		this.nesting = code === NESTING;
	}
}

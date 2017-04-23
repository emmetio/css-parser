'use strict';

import Token from './token';
import FragmentsToken from './fragments';
import { RULE_START, RULE_END } from './separator';

const ARGUMENTS_START = 40;  // (
const ARGUMENTS_END   = 41;  // )

export default function(stream, tokenConsumer) {
	const start = stream.pos;

	if (stream.eat(ARGUMENTS_START)) {
		const tokens = [];
		let t, ch;
		// in LESS, it’s possible to separate arguments list either by `;` or `,`.
		// In first case, we should keep comma-separated item as a single argument
		let usePropTerminator = false;

		while (!stream.eof()) {
			if (isUnexpectedTerminator(stream.peek()) || stream.eat(ARGUMENTS_END)) {
				break;
			}

			t = tokenConsumer(stream);
			if (!t) {
				break;
			}

			if (t.propertyTerminator) {
				usePropTerminator = true;
			}

			tokens.push(t);
		}

		return createArguments(stream, tokens, start, usePropTerminator);
	}
}

function isUnexpectedTerminator(code) {
	return code === RULE_START || code === RULE_END;
}

function createArguments(stream, tokens, start, usePropTerminator) {
	const sep = usePropTerminator ? semicolonSeparator : commaSeparator;
	const list = [];
	let arg = [];

	for (let i = 0, il = tokens.length, token; i < il; i++) {
		token = tokens[i];
		if (sep(token)) {
			if (arg.length) {
				list.push(new FragmentsToken(stream, arg));
				args = [];
			} else {
				list.push(new Token(stream, token.start, token.start));
			}
		} else {
			arg.push(token);
		}
	}

	if (arg.length) {
		list.push(new FragmentsToken(stream, arg));
	}

	return new ArgumentsToken(list, stream, start);
}

function commaSeparator(token) {
	return token.comma;
}

function semicolonSeparator(token) {
	return token.propertyTerminator;
}

/**
 * A token that represents a set of arguments between `(` and `)`
 */
export class ArgumentsToken extends Token {
	constructor(list, stream, start, end) {
		super(stream, start, end);
		this.list = list;
		this.type = 'arguments';
	}
}

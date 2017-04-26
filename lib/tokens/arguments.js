'use strict';

import Token from './token';
import { RULE_START, RULE_END } from './separator';
import { last } from '../utils';

const ARGUMENTS_START = 40;  // (
const ARGUMENTS_END   = 41;  // )

export default function(stream, tokenConsumer) {
	if (stream.peek() === ARGUMENTS_START) {
		stream.start = stream.pos;
		stream.next();

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

		return createArgumentList(stream, tokens, usePropTerminator);
	}
}

function isUnexpectedTerminator(code) {
	return code === RULE_START || code === RULE_END;
}

function createArgumentList(stream, tokens, usePropTerminator) {
	const argsToken = new Token(stream, 'arguments');
	const isSeparator = usePropTerminator ? semicolonSeparator : commaSeparator;
	let arg = [];

	for (let i = 0, il = tokens.length, token; i < il; i++) {
		token = tokens[i];
		if (isSeparator(token)) {
			argsToken.add(createArgument(stream, arg) || createEmptyArgument(stream, token.start));
		} else {
			arg.push(token);
		}
	}

	if (arg.length) {
		argsToken.add(createArgument(stream, arg));
	}

	return argsToken;
}

function createArgument(stream, tokens) {
	if (tokens && tokens.length) {
		const arg = new Token(stream, 'argument', tokens[0].start, last(tokens).end);

		for (let i = 0; i < tokens.length; i++) {
			arg.add(tokens[i]);
		}

		return arg;
	}
}

function createEmptyArgument(stream, pos) {
	const token = new Token(stream, 'argument', pos, pos);
	token.property('empty', true);
	return token;
}

function commaSeparator(token) {
	return token.comma;
}

function semicolonSeparator(token) {
	return token.propertyTerminator;
}

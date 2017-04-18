'use strict';

import { isQuote } from '@emmetio/stream-reader-utils';
import Token from './token';

/**
 * Consumes quoted string from current string and returns token with consumed
 * data or `null`, if string wasn’t consumed
 * @param  {StreamReader} stream
 * @return {StringToken}
 */
export default function eatString(stream) {
	const start = stream.pos;
	let ch = stream.peek(), pos;

	if (isQuote(ch)) {
		stream.next();
		const quote = ch;
		const valueStart = stream.pos;

		while (!stream.eof()) {
			pos = stream.pos;
			if (stream.eat(quote) || stream.eat(isNewline)) {
				// found end of string or newline without preceding '\',
				// which is not allowed (don’t throw error, for now)
				break;
			} else if (stream.eat(92) /* \ */) {
				// backslash allows newline in string
				stream.eat(isNewline);
			}

			stream.next();
		}

		// either reached EOF or explicitly stopped at string end
		return new StringToken(
			String.fromCharCode(quote),
			new Token(stream, valueStart, pos),
			stream,
			start
		);
	}

	stream.pos = start;
	return null;
}

export class StringToken extends Token {
	constructor(quote, value, stream, start, end) {
		super(stream, start, end);
		this.type = 'string';
		this.quote = quote;
		this.value = value;
	}
}

function isNewline(code) {
	return code === 10  /* LF */ || code === 13 /* CR */;
}

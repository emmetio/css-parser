'use strict';

import { isSpace } from '@emmetio/stream-reader-utils';
import Token from './token';

/**
 * Consumes white-space tokens from given stream
 */
export default function eatWhitespace(stream) {
	const start = stream.pos;
	if (stream.eatWhile(isSpace)) {
		return new WhiteSpaceToken(stream, start);
	}
}

export class WhiteSpaceToken extends Token {
	constructor(stream, start, end) {
		super(stream, start, end);
		this.type = 'whitespace';
	}
}

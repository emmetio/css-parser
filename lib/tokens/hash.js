'use strict';

import { isAlpha, isNumber } from '@emmetio/stream-reader-utils';
import Token from './token';

export default function eatHash(stream) {
	const start = stream.pos;

	if (stream.eat(35 /* # */)) {
		stream.start = stream.pos;
		stream.eatWhile(isHashValue);
		return new HashToken(new Token(stream), stream, start);
	}

	stream.pos = start;
}

function isHashValue(code) {
	return isNumber(code) || isAlpha(code, 65 /* A */, 70 /* F */)
		|| code === 95 /* _ */ || code === 45 /* - */
		|| code > 128 /* non-ASCII */
}

export class HashToken extends Token {
	constructor(value, stream, start, end) {
		super(stream, start, end);
		this.type = 'hash';
		this.value = value;
	}
}

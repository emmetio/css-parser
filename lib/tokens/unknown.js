'use strict';

import Token from './token';

export default function unknown(stream) {
	const start = stream.pos;
	const code = stream.next();
	if (!isNaN(code)) {
		// console.log('unknown', String.fromCharCode(code), start);
		return new UnknownToken(code, stream, start);
	}

	stream.pos = start;
}

class UnknownToken extends Token {
	constructor(code, stream, start, end) {
		super(stream, start, end);
		this.type = 'unknown';
		this.code = code;
	}
}

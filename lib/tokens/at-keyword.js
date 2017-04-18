'use strict';

import Token from './token';
import ident from './ident';

/**
 * Consumes at-keyword from given stream
 */
export default function(stream) {
	const start = stream.pos;

	if (stream.eatWhile(64 /* @ */)) {
		const name = ident(stream);
		if (name) {
			return new AtKeywordToken(name, stream, start);
		}
	}

	stream.pos = start;
}

export class AtKeywordToken extends Token {
	constructor(name, stream, start, end) {
		super(stream, start, end);
		this.type = 'at-keyword';
		this.name = name;
	}
}

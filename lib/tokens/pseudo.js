'use strict';

import Token from './token';
import ident from './ident';

/**
 * Consumes pseudo-selector from given stream
 */
export default function(stream) {
	const start = stream.pos;

	if (stream.eatWhile(58 /* : */)) {
		const name = ident(stream);
		if (name) {
			return new PseudoToken(name, stream, start);
		}
	}

	stream.pos = start;
}

export class PseudoToken extends Token {
	constructor(name, stream, start, end) {
		super(stream, start, end);
		this.type = 'pseudo';
		this.name = name;
	}
}

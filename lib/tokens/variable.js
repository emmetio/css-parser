'use strict';

import Token from './token';
import ident from './ident';

/**
 * Consumes SCSS variable from given stream
 */
export default function(stream) {
	const start = stream.pos;

	if (stream.eatWhile(36 /* $ */)) {
		const name = ident(stream);
		if (name) {
			return new VariableToken(name, stream, start);
		}
	}

	stream.pos = start;
}

export class VariableToken extends Token {
	constructor(name, stream, start, end) {
		super(stream, start, end);
		this.type = 'variable';
		this.name = name;
	}
}

'use strict';

import Token from './token';
import eatIdent from './ident';

/**
 * Consumes id fragment from given stream, e.g. `#foo`
 * @param  {StreamReader} stream
 * @return {IdToken}
 */
export default function eatId(stream) {
	const start = stream.pos;

	if (stream.eat(35 /* # */)) {
		return new IdToken(eatIdent(stream), stream, start);
	}
}

export class IdToken extends Token {
	constructor(name, stream, start, end) {
		super(stream, start, end);
		this.type = 'id';
		this.name = name;
	}
}

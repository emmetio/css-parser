'use strict';

import Token from './token';
import ident from './ident';

/**
 * Consumes !important token
 * @param  {StreamReader} stream
 * @return {UrlToken}
 */
export default function(stream, ch) {
	if (stream.eat(33 /* ! */)) {
		const start = stream.pos;
		stream.next();
		return new ImportantToken(ident(stream), stream, start);
	}
}

class ImportantToken extends Token {
	constructor(value, stream, start, end) {
		super(stream, start, end);
		this.type = 'important';
		this.value = value;
	}
}

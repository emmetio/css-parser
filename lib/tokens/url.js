'use strict';

import { isSpace } from '@emmetio/stream-reader-utils';

import Token from './token';
import string from './string';
import unquoted from './unquoted';

/**
 * Consumes URL token from given stream
 * @param  {StreamReader} stream
 * @return {UrlToken}        [description]
 */
export default function(stream) {
	const start = stream.pos;

	if (stream.eat(117) && stream.eat(114) && stream.eat(108) && stream.eat(40)) {
		// consumed `url(`
		stream.eatWhile(isSpace);
		const value = string(stream) || unquoted(stream);
		stream.eatWhile(isSpace);
		stream.eat(41); // )
		return new UrlToken(value, stream, start);
	}

	stream.pos = start;
}

class UrlToken extends Token {
	constructor(value, stream, start, end) {
		super(stream, start, end);
		this.type = 'url';
		this.value = value;
	}
}

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
			stream.start = start;
			return new Token(stream, 'at-keyword').add(name);
		}
	}

	stream.pos = start;
}

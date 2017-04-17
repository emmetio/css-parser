'use strict';

import Token from './token';
import eatIdent from './ident';

/**
 * Consumes class fragment from given stream, e.g. `.foo`
 * @param  {StreamReader} stream
 * @return {ClassToken}
 */
export default function eatClass(stream) {
	const start = stream.pos;

	if (stream.eat(46 /* . */)) {
		return new ClassToken(eatIdent(stream), stream, start);
	}
}

class ClassToken extends Token {
	constructor(name, stream, start, end) {
		super(stream, start, end);
		this.type = 'class';
		this.name = name;
	}
}

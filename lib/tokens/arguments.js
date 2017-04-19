'use strict';

import Token from './token';

/**
 * A token that represents a set of arguments between `(` and `)`
 */
export default class ArgumentsToken extends Token {
	constructor(args, stream, start, end) {
		super(stream, start, end);
		this.list = args;
		this.type = 'arguments';
	}
}

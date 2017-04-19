'use strict';

import Token from './token';

/**
 * A token that represents a function call or definition
 */
export default class FunctionToken extends Token {
	constructor(name, args, stream) {
		super(stream, name.start, args.end);
		this.name = name;
		this.arguments = args;
		this.type = 'function';
	}
}

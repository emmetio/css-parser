'use strict';

import Token from './token';

/**
 * A token that contains a list of tokens
 */
export default class FragmentsToken extends Token {
	constructor(stream, tokens) {
		let start = stream.pos;
		let end = stream.pos;

		if (tokens && tokens.length) {
			start = tokens[0].start;
			end = tokens[tokens.length - 1].end;
		}

		super(stream, start, end);
		this.type = 'fragments';
		this.fragments = tokens;
	}
}

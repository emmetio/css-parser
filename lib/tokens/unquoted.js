'use strict';

import { isQuote, isSpace } from '@emmetio/stream-reader-utils';
import Token from './token';

/**
 * Consumes unquoted value from given stream
 * @param  {StreamReader} stream
 * @return {UnquotedToken}
 */
export default function(stream) {
	const start = stream.pos;
	if (stream.eatWhile(isUnquoted)) {
		return new UnquotedToken(stream, start);
	}
}

function isUnquoted(code) {
	return !isNaN(code) && !isQuote(code) && !isSpace(code)
		&& code !== 40 /* ( */ && code !== 41 /* ) */ && code !== 92 /* \ */
		&& !isNonPrintable(code);
}

function isNonPrintable(code) {
	return (code >= 0 && code <= 8) || code === 11
	|| (code >= 14 && code <= 31) || code === 127;
}

export class UnquotedToken extends Token {
	constructor(stream, start, end) {
		super(stream, start, end);
		this.type = 'unquoted';
	}
}

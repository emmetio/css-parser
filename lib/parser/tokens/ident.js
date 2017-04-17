'use strict';

import { isAlpha, isNumber } from '@emmetio/stream-reader-utils';
import Token from './token';

const HYPHEN     = 45;
const UNDERSCORE = 95;

export default function eatIdent(stream) {
	const start = stream.pos;

	stream.eat(HYPHEN);
	if (stream.eat(isIdentStart)) {
		stream.eatWhile(isIdent);
		return new IdentToken(stream, start);
	}

	stream.pos = start;
	return false;
}

class IdentToken extends Token {
	constructor(stream, start, end) {
		super(stream, start, end);
		this.type = 'ident';
	}
}

function isIdentStart(code) {
	return code === UNDERSCORE || isAlpha(code) || code >= 128;
}

function isIdent(code) {
	return isNumber(code) || isIdentStart(code);
}

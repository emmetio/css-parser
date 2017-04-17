'use strict';

import { isNumber } from '@emmetio/stream-reader-utils';
import Token from './token';
import eatIdent from './ident';

const DOT = 46; // .

/**
 * Consumes number from given string, e.g. `10px`
 * @param  {StreamReader} stream
 * @return {NumberToken}
 */
export default function eatNumber(stream) {
	const num = getNumToken(stream);
	if (num) {
		return new NumberToken(num, eatPercent(stream) || eatIdent(stream));
	}
}

function getNumToken(stream) {
	const start = stream.pos;

	stream.eat(isOperator);
	if (stream.eatWhile(isNumber)) {
		let end = stream.pos;
		if (stream.eat(DOT) && stream.eatWhile(isNumber)) {
			end = stream.pos;
		} else {
			stream.pos = end;
		}

		return new NumToken(stream, start, end);
	} else if (stream.eat(DOT) && stream.eatWhile(isNumber)) {
		return new NumToken(stream, start);
	}

	stream.pos = start;
}

function eatPercent(stream) {
	if (stream.peek() === 37 /* % */) {
		const start = stream.pos;
		stream.next();
		return new Token(stream, start);
	}
}

function isOperator(code) {
	return code === 45 /* - */ || code === 43 /* + */;
}

class NumberToken extends Token {
	constructor(number, unit, stream, start, end) {
		super(stream, start, end);
		this.type = 'number';
		this.number = number;
		this.unit = unit;
	}
}

class NumToken extends Token {
	constructor(stream, start, end) {
		super(stream, start, end);
		this.type = 'num';
	}

	toNumber() {
		return parseFloat(this.valueOf());
	}
}

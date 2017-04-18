'use strict';

import { isSpace } from '@emmetio/stream-reader-utils';
import Token from './token';
import eatIdent from './ident';
import eatString from './string';
import eatComment from './comment';

const ATTR_START = 91; // [
const ATTR_END   = 93; // ]

/**
 * Consumes attribute from given string, e.g. value between [ and ]
 * @param  {StreamReader} stream
 * @return {AttributeToken}
 */
export default function eatAttribuite(stream) {
	const start = stream.pos;

	if (stream.eat(ATTR_START)) {
		skip(stream);
		const name = eatIdent(stream);

		skip(stream);
		const opStart = stream.pos;
		stream.eatWhile(isOperator);
		const operator = new Token(stream, opStart);

		skip(stream);
		const value = eatString(stream) || eatIdent(stream);

		// in case of invalid attribute definition, consume till the end of attribute
		while (!stream.eof()) {
			if (stream.eat(ATTR_END)) {
				break;
			} else if (!skip(stream) && !eatIdent(stream) && !eatString(stream)) {
				stream.next();
			}
		}

		return new AttributeToken(name, value, operator, stream, start);
	}
}

export class AttributeToken extends Token {
	constructor(name, value, operator, stream, start, end) {
		super(stream, start, end);
		this.type = 'attribute';
		this.name = name;
		this.value = value;
		this.operator = operator;
	}
}

function skip(stream) {
	while (!stream.eof()) {
		if (!stream.eatWhile(isSpace) || !eatComment(stream)) {
			return true;
		}
	}
}

function isOperator(code) {
	return code === 126 /* ~ */
		|| code === 124 /* | */
		|| code === 94  /* ^ */
		|| code === 36  /* $ */
		|| code === 42  /* * */
		|| code === 61; /* = */
}

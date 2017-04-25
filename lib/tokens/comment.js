'use strict';

import Token from './token';

const ASTERISK = 42;
const SLASH    = 47;

/**
 * Consumes comment from given stream: either multi-line or single-line
 * @param  {StreamReader} stream
 * @return {CommentToken}
 */
export default function(stream) {
	return singleLineComment(stream) || multiLineComment(stream);
}

export function singleLineComment(stream) {
	const start = stream.start;
	if (stream.eat(SLASH) && stream.eat(SLASH)) {
		// single-line comment, consume till the end of line
		stream.eatWhile(notLineBreak);
		stream.eat(isLineBreak);
		return new CommentToken(stream, start);
	}

	stream.pos = stream.start;
}

export function multiLineComment(stream) {
	const start = stream.start;
	if (stream.eat(SLASH) && stream.eat(ASTERISK)) {
		while (!stream.eof()) {
			if (stream.next() === ASTERISK && stream.eat(SLASH)) {
				break;
			}
		}

		return new CommentToken(stream, start);
	}

	stream.pos = stream.start;
}

export class CommentToken extends Token {
	constructor(stream, start, end) {
		super(stream, start, end);
		this.type = 'comment';
	}
}

function isLineBreak(code) {
	return code === 10 /* LF */ || code === 13 /* CR */;
}

function notLineBreak(code) {
	return !isLineBreak(code);
}

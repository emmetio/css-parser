'use strict';

import Token from './token';

const SINGLE_LINE = 1;
const MULTI_LINE  = 2;

const ASTERISK = 42;
const SLASH    = 47;

/**
 * Consumes comment from given stream: either multi-line or single-line
 * @param  {StreamReader} stream
 * @return {CommentToken}
 */
export default function(stream) {
	const start = stream.pos;

	switch (isCommentStart(stream, true)) {
		case SINGLE_LINE:
			// single-line comment, consume till the end of line
			stream.eatWhile(notLineBreak);
			stream.eat(isLineBreak);
			return new CommentToken(stream, start);

		case MULTI_LINE:
			while (!stream.eof()) {
				if (stream.next() === ASTERISK && stream.eat(SLASH)) {
					break;
				}
			}

			return new CommentToken(stream, start);
	}

	stream.pos = start;
}

/**
 * Eats comment start, if possible
 * @param  {StreamReader} stream
 * @param  {Boolean}      consume Keep tream position at the end of comment start,
 *                                if matched
 * @return {Number} Returns type of comment, if consumed
 */
export function isCommentStart(stream, consume) {
	const start = stream.start;
	const pos = stream.pos;
	let result = 0;

	if (stream.eat(SLASH)) {
		if (stream.eat(SLASH)) {
			result = SINGLE_LINE;
		} else if (stream.eat(ASTERISK)) {
			result = MULTI_LINE;
		}
	}

	if (result && consume) {
		stream.start = pos;
	} else {
		stream.pos = pos;
	}

	return result;
}

class CommentToken extends Token {
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

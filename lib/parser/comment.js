'use strict';

const SINGLE_LINE = 1;
const MULTI_LINE  = 2;

const ASTERISK = 42;
const SLASH    = 47;

/**
 * Consumes comment from given stream: either multi-line or single-line
 * @param  {StreamReader} stream
 * @return {Boolean} Returns `true` if comment was consumed
 */
export default function(stream) {
	const start = stream.pos;

	switch (eatCommentStart(stream)) {
		case SINGLE_LINE:
			// single-line comment, consume till the end of line
			stream.eatWhile(notLineBreak);
			stream.eat(isLineBreak);
			return true;

		case MULTI_LINE:
			while (!stream.eof()) {
				if (stream.next() === ASTERISK && stream.eat(SLASH)) {
					break;
				}
			}

			return true;
	}

	stream.pos = start;
	return false;
}

/**
 * Eats comment start, if possible
 * @param  {StreamReader} stream
 * @return {Number}        Returns type of comment, if consumed
 */
export function eatCommentStart(stream) {
	const start = stream.pos;

	if (stream.eat(SLASH)) {
		if (stream.eat(SLASH)) {
			stream.start = start;
			return SINGLE_LINE;
		} else if (stream.eat(ASTERISK)) {
			stream.start = start;
			return MULTI_LINE;
		}
	}

	stream.pos = start;
	return 0;
}

function isLineBreak(code) {
	return code === 10 /* LF */ || code === 13 /* CR */;
}

function notLineBreak(code) {
	return !isLineBreak(code);
}

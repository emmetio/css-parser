'use strict';

import { eatQuoted, eatPair, isSpace, isQuote } from '@emmetio/stream-reader-utils';
import isSeparator from './separator';
import { eatCommentStart } from './comment';

const LSQUARE_BRACE = 91,  RSQUARE_BRACE = 93;
const LROUND_BRACE  = 40,  RROUND_BRACE  = 41;

/**
 * Consumes stylesheet identifier: a property, variable or selector
 * @param  {StreamReader} stream
 * @return {Boolean} Returns `true` if identifier was consumed
 */
export default function(stream) {
	return eatQuoted(stream)
		|| eatPair(stream, LROUND_BRACE, RROUND_BRACE)
		|| eatPair(stream, LSQUARE_BRACE, RSQUARE_BRACE)
		|| eatAbstractIdent(stream);
}

/**
 * Eats abstract identifier from stream: a set of characters that can possibly
 * be used as an identifier
 * @param  {StreamReader} stream
 * @return {Boolean}
 */
function eatAbstractIdent(stream) {
	const start = stream.pos;

	while (!stream.eof()) {
		if (eatCommentStart(stream)) {
			// reached comment start: should stop parsing before it
			stream.pos = stream.start;
			break;
		} else if (!stream.eat(isAbstractIdent)) {
			break;
		}
	}

	if (start === stream.pos) {
		// didn’t consumed anything
		return false;
	}

	stream.start = start;
	return true;
}

/**
 * Check if given character code can be used as an identifier
 * @param  {StreamReader} stream
 * @return {Boolean}
 */
function isAbstractIdent(code) {
	return !isNaN(code) && !isSpace(code) && !isQuote(code) && !isSeparator(code)
		&& code !== LSQUARE_BRACE && code !== RSQUARE_BRACE
		&& code !== LROUND_BRACE && code !== RROUND_BRACE;
}

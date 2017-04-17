'use strict';

import { eatQuoted, eatPair, isSpace, isQuote } from '@emmetio/stream-reader-utils';
import isSeparator from './separator';
import { isCommentStart } from './comment';

/**
 * Consumes stylesheet identifier: a property, variable or selector
 * @param  {StreamReader} stream
 * @return {Boolean} Returns `true` if identifier was consumed
 */
export default function(stream) {
	return eatQuoted(stream) || eatAbstractIdent(stream);
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
		if (isCommentStart(stream) || !stream.eat(isAbstractIdent)) {
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
	return !isNaN(code) && !isSpace(code) && !isQuote(code) && !isSeparator(code);
}

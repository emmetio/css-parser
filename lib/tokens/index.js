'use strict';

import args from './arguments';
import atKeyword from './at-keyword';
import attribute from './attribute';
import className from './class';
import combinator from './combinator';
import comment from './comment';
import hash from './hash';
import id from './id';
import ident from './ident';
import number from './number';
import pseudo from './pseudo';
import separator from './separator';
import string from './string';
import variable from './variable';
import whitespace from './whitespace';

/**
 * Group tokens by commonly used context
 */

export default function(stream) {
	return selector(stream) || keyword(stream) || value(stream)
		|| separator(stream) || formatting(stream);
}

export function selector(stream) {
	return ident(stream) || className(stream) || id(stream) || attribute(stream)
		|| pseudo(stream) || atKeyword(stream) || combinator(stream);
}

export function keyword(stream) {
	return variable(stream) || ident(stream) || atKeyword(stream);
}

export function value(stream) {
	return string(stream) || number(stream) || hash(stream);
}

export function formatting(stream) {
	return comment(stream) || whitespace(stream);
}

export { args, comment, whitespace, separator, combinator }

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
import separator from './separator';
import string from './string';
import url from './url';
import variable from './variable';
import whitespace from './whitespace';

import Token from './token';
import FunctionToken from './function';
import FragmentsToken from './fragments';

/**
 * Group tokens by commonly used context
 */

export default function consumeToken(stream) {
	const _token = any(stream) || args(stream, consumeToken);
	if (_token && _token.type === 'ident') {
		const _args = args(stream, consumeToken);
		if (_args) {
			// An identifier followed by arguments – function call
			return new FunctionToken(_token, _args, stream);
		}
	}

	return _token;
}

export function fastParse(stream) {
	return string(stream) || whitespace(stream) || separator(stream)
		|| url(stream) || comment(stream) || args(stream, fastParse);
}

function fastParseToken(stream) {
	return string(stream) || url(stream) || separator(stream) || comment(stream) || whitespace(stream);
}

export function any(stream) {
	return url(stream) || selector(stream) || value(stream) || keyword(stream)
		|| separator(stream) || formatting(stream);
}

export function selector(stream) {
	return ident(stream) || className(stream) || id(stream) || attribute(stream)
		|| atKeyword(stream) || combinator(stream);
}

export function keyword(stream) {
	return variable(stream) || atKeyword(stream) || ident(stream);
}

export function value(stream) {
	return string(stream) || number(stream) || hash(stream) || url(stream);
}

export function formatting(stream) {
	return comment(stream) || whitespace(stream);
}

export function fragments(stream, items) {
	return new FragmentsToken(stream, items);
}

export function unknown(stream) {
	return new Token(stream);
}

export { args, comment, whitespace, separator, combinator, Token }

'use strict';

/**
 * Separates given list of tokens by specified separator
 * @param  {Token[]}    tokens
 * @param  {*|Function} sep
 * @return {Array[]}
 */
export function splitList(tokens, sep) {
	if (!tokens.length) {
		return [];
	}

	let itemTokens = [];
	const list = [];
	const test = typeof sep === 'function'
		? sep
		: token => token === sep || token.type === sep;

	for (let i = 0; i < tokens.length; i++) {
		if (test(tokens[i])) {
			if (itemTokens.length) {
				list.push(itemTokens);
			}

			itemTokens = [];
		} else {
			itemTokens.push(tokens[i]);
		}
	}

	if (itemTokens.length) {
		list.push(itemTokens);
	}

	return list;
}

/**
 * Removes tokens that matches given criteria from start and end of given list
 * @param  {Token[]}   tokens
 * @param  {Function}  test
 * @return {Token[]}
 */
export function trimTokens(tokens, test) {
	let len;
	while (len !== tokens.length) {
		len = tokens.length;
		if (isFormattingToken(tokens[0])) {
			tokens.shift();
		}

		if (isFormattingToken(last(tokens))) {
			tokens.pop();
		}
	}

	return tokens;
}

/**
 * Trims formatting tokens (whitespace and comments) from the beginning and end
 * of given token list
 * @param  {Token[]} tokens
 * @return {Token[]}
 */
export function trimFormatting(tokens) {
	return trimTokens(tokens, isFormattingToken);
}

/**
 * Check if given token is a formatting one (whitespace or comment)
 * @param  {Token}  token
 * @return {Boolean}
 */
export function isFormattingToken(token) {
	return type(token) === 'whitespace' || type(token) === 'comment';
}

/**
 * Consumes string char-by-char from given stream
 * @param  {StreamReader} stream
 * @param  {String} string
 * @return {Boolean} Returns `true` if string was completely consumed
 */
export function eatString(stream, string) {
	const start = stream.pos;

	for (let i = 0, il = string.length; i < il; i++) {
		if (!stream.eat(string.charCodeAt(i))) {
			stream.pos = start;
			return false;
		}
	}

	return true;
}

export function consume(stream, match) {
	const start = stream.pos;
	if (stream.eat(match)) {
		stream.start = start;
		return true;
	}

	return false;
}

export function consumeWhile(stream, match) {
	const start = stream.pos;
	if (stream.eatWhile(match)) {
		stream.start = start;
		return true;
	}

	return false;
}

export function commaSeparator(token) {
	return token.comma;
}

/**
 * Returns type of given token
 * @param  {Token} token
 * @return {String}
 */
export function type(token) {
	return token && token.type;
}

export function last(arr) {
	return arr[arr.length - 1];
}

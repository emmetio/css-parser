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
	tokens = tokens.slice();

	while (tokens.length) {
		if (!test(tokens[0])) {
			break;
		}
		tokens.shift();
	}

	while (tokens.length) {
		if (!test(tokens[tokens.length - 1])) {
			break;
		}
		tokens.pop();
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
	return token.type === 'comment' || token.type === 'whitespace';
}

export function commaSeparator(token) {
	return token.comma;
}

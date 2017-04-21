'use strict';

/**
 * Separates given list of tokens by specified separator
 * @param  {Token[]}    tokens
 * @param  {*|Function} sep
 * @return {Array[]}
 */
export function splitList(tokens, sep) {
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

'use strict';

/**
 * Separates given list of tokens by specified separator
 * @param  {Token[]}    tokens
 * @param  {*|Function} sep
 * @return {Array[]}
 */
export function separateList(tokens, sep) {
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

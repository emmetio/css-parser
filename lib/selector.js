'use strict';

import StreamReader from '@emmetio/stream-reader';
import Token from './tokens/token';
import  consumeToken from './tokens/index';
import { last, trimFormatting } from './utils';

/**
 * Parses given rule selector into a set of separate selector (separated by `,`
 * in original selector), each containing fragments like #id, .class, node-name
 * etc.
 * @param  {String|StreamReader} source
 * @return {Token[]}
 */
export default function parseSelector(source) {
	const stream = typeof source === 'string' ? new StreamReader(source) : source;
	const selectors = [];
	const fragments = [];
	const flush = () => {
		const clean = trimFormatting(fragments);

		if (clean.length) {
			const sel = new Token(stream, 'selector', clean[0].start, last(clean).end);
			for (let i = 0; i < clean.length; i++) {
				sel.add(clean[i]);
			}
			selectors.push(sel);
		}

		fragments.length = 0;
	};

	let token;
	while (!stream.eof()) {
		if (stream.eat(44 /* , */)) {
			flush();
		} else if (token = consumeToken(stream)) {
			if (token.type !== 'comment') {
				fragments.push(token);
			}
		} else {
			throw stream.error('Unexpected character in selector');
		}
	}

	flush();
	return selectors;
}

'use strict';

import StreamReader from '@emmetio/stream-reader';
import Stylesheet from './stylesheet';
import createRule from './rule';
import createProperty from './property';
import token, { unknown, Token } from './tokens/index';

export default function(source) {
	const stream = typeof source === 'string' ? new StreamReader(source) : source;
	const root = new Stylesheet();
	let tokens = [];
	let ctx = root, child, t;

	while (!stream.eof()) {
		t = token(stream);

		if (!t) {
			// unable to identify following character, consume it as unknown token
			stream.start = stream.pos;
			stream.next();
			tokens.push(unknown(stream));
		} else if (t.propertyTerminator) {
			// Tokens consumed before are CSS property
			tokens.push(t);
			ctx.addChild(createProperty(stream, tokens, t));
			tokens = [];
		} else if (t.ruleStart) {
			// Tokens consumed before are CSS rule
			child = createRule(stream, tokens, t);
			if (child) {
				ctx.addChild(child);
				ctx = child;
			}
			tokens = [];
		} else if (t.ruleEnd) {
			// Finalize previously consumed tokens as CSS property
			ctx.addChild(createProperty(stream, tokens));
			tokens = [];

			// In case of invalid stylesheet with redundant `}`,
			// don’t modify root section.
			if (ctx.type !== 'root') {
				ctx.contentEnd = t;
			}

			ctx = ctx.parent || ctx;
		} else {
			tokens.push(t);
		}
	}

	// save unterminated tokens as property
	ctx.addChild(createProperty(stream, tokens));

	return root;
}

export { token, createProperty, createRule, Token }

'use strict';

import StreamReader from '@emmetio/stream-reader';
import { isSpace } from '@emmetio/stream-reader-utils';
import Node from './lib/node';
import createToken from './lib/token';
import eatComment from './lib/parser/comment';
import eatIdent from './lib/parser/identifier';
import {
	isSectionStart, isSectionEnd,
	isPropertySeparator, isPropertyTerminator
} from './lib/parser/separator';

/**
 * Parses given CSS (or stylesheet) code into a very simple and minimalistic
 * object model
 * @param  {StreamReader|String} source
 * @return {Node}
 */
export default function parseCSS(source) {
	const stream = typeof source === 'string' ? new StreamReader(source) : source;
	const root = new Node('root');
	let ctx = root, child, ch;

	/** @type {Token} */
	let ident, name;

	while (!stream.eof()) {
		if (stream.eatWhile(isSpace) || eatComment(stream)) {
			continue;
		}

		ch = stream.peek();
		if (eatIdent(stream)) {
			if (ch === 64 /* @ */) {
				// Edge case for some CSS properties like `@import`:
				// at-rules always starts a new property or section
				name = createToken(stream);
				ident = null;
			} else {
				ident = createToken(stream, ident && ident.start);
			}
		} else if (isPropertySeparator(ch)) {
			// Could be a property separator or a part of selector
			if (name) {
				// Already splitted by `:`, looks like pseudo-selector
				name = createToken(stream, name.start, ident ? ident.end : name.end);
			} else if (ident) {
				name = ident;
			} else {
				// No consumed data before `:`, it might be a special CSS
				// selector like `::slotted()`. Should create an empty name
				// pointer
				name = createToken(stream, stream.pos);
			}
			ident = null;
			stream.next();
		} else if (isPropertyTerminator(ch)) {
			// data consumed before is a CSS property, create node for it
			stream.start = stream.pos;
			stream.next();
			ctx.addChild(createProperty(name, ident, createToken(stream)));
			name = ident = null;
		} else if (isSectionStart(ch)) {
			// Data consumed before is a CSS selector, create node for it
			if (name && ident) {
				// Seems like property-value pair, combine it into a single selector
				name = createToken(stream, name.start, ident.end);
			} else if (ident) {
				name = ident;
			} else {
				// Something weird: no section name. Create empty stub for it
				name = createToken(stream, stream.pos);
			}

			stream.next();
			child = new Node('rule', name, createToken(stream, stream.pos));
			ctx.addChild(child);
			ctx = child;
			name = ident = child = null;
		} else if (isSectionEnd(ch)) {
			// Finalize context section
			if (name || ident) {
				// There’s pending CSS property
				ctx.addChild(createProperty(name, ident));
			}

			stream.start = stream.pos;
			stream.next();
			ident = createToken(stream);

			if (ctx.type !== 'root') {
				// In case of invalid stylesheet with redundant `}`,
				// don’t modify root section.
				ctx._value = createToken(stream, ctx._value.start, stream.start);
				ctx._terminator = createToken(stream);
			}

			ctx = ctx.parent || ctx;
			name = ident = child = null;
		} else {
			throw new Error(`Unexpected ${String.fromCharCode(ch)} at ${stream.pos}`);
		}
	}

	if (name || ident) {
		// There’s pending CSS property
		ctx.addChild(createProperty(name, ident));
	}

	return root;
}

function createProperty(name, value, terminator) {
	return new Node('property', name || value, name ? value : null, terminator);
}

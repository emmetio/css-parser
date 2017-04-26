'use strict';

import StreamReader from '@emmetio/stream-reader';
import Stylesheet from './lib/stylesheet';
import createRule from './lib/rule';
import createProperty from './lib/property';
import { Token } from './lib/tokens/index';

import atKeyword from './lib/tokens/at-keyword';
import string from './lib/tokens/string';
import separator from './lib/tokens/separator';
import comment, { multiLineComment } from './lib/tokens/comment';
import whitespace from './lib/tokens/whitespace';

const LBRACE = 40;  // (
const RBRACE = 41;  // )

export default function parseStylesheet(source) {
	const stream = typeof source === 'string' ? new StreamReader(source) : source;
	const root = new Stylesheet();
	let ctx = root, child, accum;
	let token, start;
	let tokens = [];

	while (!stream.eof()) {
		token = atKeyword(stream) || separator(stream) || whitespace(stream) || comment(stream);
		if (token) {
			if (accum) {
				tokens.push(accum);
				accum = null;
			}

			if (token.propertyTerminator) {
				ctx.addChild(createProperty(stream, tokens, token));
				tokens = [];
			} else if (token.ruleStart) {
				child = createRule(stream, tokens, token);
				ctx.addChild(child);
				ctx = child;
				tokens = [];
			} else if (token.ruleEnd) {
				// Finalize context section
				ctx.addChild(createProperty(stream, tokens));

				if (ctx.type !== 'root') {
					// In case of invalid stylesheet with redundant `}`,
					// don’t modify root section.
					ctx.contentRange.end = token.end;
					ctx = ctx.parent;
				}

				tokens = [];
			} else {
				tokens.push(token);
			}

			continue;
		}

		start = stream.pos;
		if (braces(stream) || string(stream) || !isNaN(stream.next())) {
			if (!accum) {
				accum = new Token(stream, start);
			} else {
				accum.end = stream.pos;
			}
		} else {
			throw new Error(`Unexpected end-of-stream at ${stream.pos}`);
		}
	}

	// Finalize all the rest properties
	ctx.addChild(createProperty(stream, tokens));

	return root;
}

function braces(stream) {
	if (stream.eat(LBRACE)) {
		let stack = 1;

		// Handle edge case: do not consume single-line comment inside braces
		// since most likely it’s an unquoted url like `http://example.com`
		while (!stream.eof()) {
			if (stream.eat(RBRACE)) {
				stack--;
				if (!stack) {
					break;
				}
			} else if (!string(stream) && !multiLineComment(stream)) {
				stream.next();
			}
		}

		return true;
	}

	return false;
}

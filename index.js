'use strict';

import StreamReader from '@emmetio/stream-reader';
import Stylesheet from './lib/stylesheet';
import createRule from './lib/rule';
import createProperty from './lib/property';

import atKeyword from './lib/tokens/at-keyword';
import separator from './lib/tokens/separator';
import { eatString } from './lib/tokens/string';
import { eatComment } from './lib/tokens/comment';
import { eatWhitespace } from './lib/tokens/whitespace';
import { eatUrl } from './lib/tokens/url';
import { Token } from './lib/tokens/index';

const LBRACE = 40;  // (
const RBRACE = 41;  // )

export default function parseStylesheet(source) {
	const stream = typeof source === 'string' ? new StreamReader(source) : source;
	const root = new Stylesheet();
	let ctx = root, child, accum, token, type;
	let tokens = [];

	while (!stream.eof()) {
		if (eatWhitespace(stream) || eatComment(stream)) {
			continue;
		}

		stream.start = stream.pos;

		if (token = separator(stream)) {
			// Consumed separator, create either rule or property from it
			accum && tokens.push(accum);
			accum = null;
			type = token.property('type');

			if (type === 'propertyTerminator') {
				ctx.addChild(createProperty(stream, tokens, token));
				tokens = [];
			} else if (type === 'ruleStart') {
				child = createRule(stream, tokens, token);
				ctx.addChild(child);
				ctx = child;
				tokens = [];
			} else if (type === 'ruleEnd') {
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
		} else if (token = atKeyword(stream)) {
			// Explictly consume @-tokens since it defines how rule or property
			// should be pre-parsed
			accum && tokens.push(accum);
			accum = null;
			tokens.push(token);
		} else if (eatBraces(stream) || eatString(stream) || !isNaN(stream.next())) {
			accum = accum || new Token(stream, 'preparse');
			accum.end = stream.pos;
		} else {
			throw new Error(`Unexpected end-of-stream at ${stream.pos}`);
		}
	}

	if (accum) {
		tokens.push(accum);
	}

	// Finalize all the rest properties
	ctx.addChild(createProperty(stream, tokens));

	return root;
}

/**
 * Consumes content inside round braces. Mostly used to skip `;` token inside
 * since in LESS it is also used to separate function arguments
 * @param  {StringReader} stream
 * @return {Boolean}
 */
function eatBraces(stream) {
	if (stream.eat(LBRACE)) {
		let stack = 1;

		while (!stream.eof()) {
			if (stream.eat(RBRACE)) {
				stack--;
				if (!stack) {
					break;
				}
			} else if (stream.eat(LBRACE)) {
				stack++;
			}else {
				// NB explicitly consume `url()` token since it may contain
				// an unquoted url like `http://example.com` which interferes
				// with single-line comment
				eatUrl(stream) || eatString(stream) || eatComment(stream) || stream.next();
			}
		}

		return true;
	}

	return false;
}

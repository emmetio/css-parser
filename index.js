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
	let ctx = root, child, accum, token;
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

			switch (token.property('type')) {
				case 'propertyTerminator':
					ctx.addChild(createProperty(stream, tokens, token));
					tokens.length = 0;
					break;

				case 'ruleStart':
					child = createRule(stream, tokens, token);
					ctx.addChild(child);
					ctx = child;
					tokens.length = 0;
					break;

				case 'ruleEnd':
					// Finalize context section
					ctx.addChild(createProperty(stream, tokens));

					if (ctx.type !== 'stylesheet') {
						// In case of invalid stylesheet with redundant `}`,
						// don’t modify root section.
						ctx.contentToken.end = token.end;
						ctx = ctx.parent;
					}

					tokens.length = 0;
					break;

				default:
					tokens.push(token);
			}
		} else if (token = atKeyword(stream)) {
			// Explictly consume @-tokens since it defines how rule or property
			// should be pre-parsed
			accum && tokens.push(accum);
			accum = null;
			tokens.push(token);
		} else if (eatUrl(stream) || eatBraces(stream) || eatString(stream) || !isNaN(stream.next())) {
			// NB explicitly consume `url()` token since it may contain
			// an unquoted url like `http://example.com` which interferes
			// with single-line comment
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
			} else {
				eatUrl(stream) || eatString(stream) || eatComment(stream) || stream.next();
			}
		}

		return true;
	}

	return false;
}

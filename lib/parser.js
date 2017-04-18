'use strict';

import StreamReader from '@emmetio/stream-reader';
import { isSpace } from '@emmetio/stream-reader-utils';
import token, { comment } from './tokens/index';
import Node from './node';
import Token from './tokens/token';
import FragmentsToken from './tokens/fragments';
import { AtKeywordToken } from './tokens/at-keyword';
import { PseudoToken } from './tokens/pseudo';

const SEPARATOR       = 44;  // ,
const PROP_SEPARATOR  = 58;  // :
const PROP_TERMINATOR = 59;  // ;
const RULE_START      = 123; // {
const RULE_END        = 125; // }

export default function(source) {
	const stream = typeof source === 'string' ? new StreamReader(source) : source;
	const root = new Node('root');
	let tokens = [];
	let ctx = root, child, ch, t;

	while (!stream.eof()) {
		if (comment(stream) || stream.eatWhile(isSpace)) {
			continue;
		}

		t = token(stream);
		if (t) {
			tokens.push(t);
			continue;
		}

		stream.start = stream.pos;
		ch = stream.next();

		if (ch === PROP_SEPARATOR) {
			if (tokens.indexOf(ch) === -1) {
				tokens.push(ch);
			}
		} else if (ch === SEPARATOR) {
			tokens.push(ch);
		} else if (ch === PROP_TERMINATOR) {
			// Tokens consumed before are a CSS property, create node for it
			ctx.addChild(createProperty(stream, tokens, new Token(stream)));
			tokens = [];
		} else if (ch === RULE_START) {
			// Tokens consumed before are a CSS rule, create node for it
			child = createRule(stream, tokens);
			ctx.addChild(child);
			ctx = child;
			tokens = [];
		} else if (ch === RULE_END) {
			// Finalize previously consumed tokens as CSS property
			if (tokens.length) {
				ctx.addChild(createProperty(stream, tokens));
				tokens = [];
			}

			if (ctx.type !== 'root') {
				// In case of invalid stylesheet with redundant `}`,
				// don’t modify root section.
				ctx._value = new Token(ctx._value.start, stream.start);
				ctx._terminator = new Token(stream);
			}

			ctx = ctx.parent || ctx;
		} else {
			// Unknown token, just save it
			tokens.push(new Token(stream));
		}
	}

	if (tokens.length) {
		// save unterminated tokens as property
		ctx.addChild(createProperty(stream, tokens));
	}

	return root;
}

function createProperty(stream, tokens, terminator) {
	// NB in LESS, fragmented properties without value like `.foo.bar;` must be
	// treated like mixin call
	let name = tokens, value;
	const sepIx = tokens.indexOf(PROP_SEPARATOR);

	if (sepIx !== -1) {
		// Has explicit property separator
		name = tokens.slice(0, sepIx);
		value = tokens.slice(sepIx + 1);
	} else if (tokens[0] instanceof AtKeywordToken) {
		// Edge case for properties like `@import "foo";`: treat at-keyword as
		// property name, the rest tokens are value
		name = [tokens[0]];
		value = tokens.slice(1);
	} else {
		// Check for `color:red;` edge case where `:red` is parsed as pseudo-selector
		for (let i = 0; i < tokens.length; i++) {
			if (tokens[i] instanceof PseudoToken) {
				name = tokens.slice(0, i);
				value = [tokens[i].name].concat(tokens.slice(i + 1));
				break;
			}
		}
	}

	if (value) {
		value = separateList(value).map(item => new FragmentsToken(stream, item));
	}

	return new Node('property',
		new FragmentsToken(stream, name),
		value && value.length ? new FragmentsToken(stream, value) : null,
		terminator
	);
}

function createRule(stream, tokens, terminator) {
	const selectors = separateList(tokens).map(item => new FragmentsToken(stream, item));


	return new Node('rule',
		new FragmentsToken(stream, selectors),
		new Token(stream, stream.pos),
		terminator
	);
}

function separateList(tokens) {
	const list = [];
	let itemTokens = [];

	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i] === SEPARATOR) {
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

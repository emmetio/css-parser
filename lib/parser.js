'use strict';

import StreamReader from '@emmetio/stream-reader';
import Stylesheet from './stylesheet';
import Rule from './rule';
import Property from './property';

import token, { args } from './tokens/index';
import Token from './tokens/token';
import FragmentsToken from './tokens/fragments';
import FunctionToken from './tokens/function';
import { AtKeywordToken } from './tokens/at-keyword';
import { IdentToken } from './tokens/ident';
import { PseudoToken } from './tokens/pseudo';

import { splitList, trimTokens } from './utils';

export default function(source) {
	const stream = typeof source === 'string' ? new StreamReader(source) : source;
	const root = new Stylesheet();
	let tokens = [];
	let ctx = root, child, t;

	while (!stream.eof()) {
		t = consumeToken(stream);

		if (!t) {
			// unable to identify following character, simply consume it as
			// unknown token
			stream.start = stream.pos;
			stream.next();
			tokens.push(new Token(stream));
		} else if (t.propertyTerminator) {
			// Tokens consumed before are a CSS property, create node for it
			ctx.addChild(createProperty(stream, tokens, t));
			tokens = [];
		} else if (t.ruleStart) {
			// Tokens consumed before are a CSS rule, create node for it
			child = createRule(stream, tokens, t);
			ctx.addChild(child);
			ctx = child;
			tokens = [];
		} else if (t.ruleEnd) {
			// Finalize previously consumed tokens as CSS property
			tokens = trimFormatting(tokens);
			if (tokens.length) {
				ctx.addChild(createProperty(stream, tokens));
				tokens = [];
			}

			// In case of invalid stylesheet with redundant `}`,
			// don’t modify root section.
			if (ctx.type !== 'root') {
				ctx.contentEndToken = t;
			}

			ctx = ctx.parent || ctx;
		} else {
			tokens.push(t);
		}
	}

	tokens = trimFormatting(tokens);
	if (tokens.length) {
		// save unterminated tokens as property
		ctx.addChild(createProperty(stream, tokens));
	}

	return root;
}

function consumeToken(stream) {
	const _token = token(stream) || args(stream, consumeToken);
	if (_token instanceof IdentToken) {
		const _args = args(stream, consumeToken);
		if (_args) {
			// An identifier followed by arguments – function call
			return new FunctionToken(_token, _args, stream);
		}
	}

	return _token;
}

function createProperty(stream, tokens, terminator) {
	// NB in LESS, fragmented properties without value like `.foo.bar;` must be
	// treated like mixin call
	tokens = trimFormatting(tokens);
	let name = tokens, value, separator;
	let sepIx = -1;

	for (let i = 0, il = tokens.length; i < il; i++) {
		if (tokens[i].propertyDelimiter) {
			sepIx = i;
			break;
		}
	}

	if (sepIx !== -1) {
		// Has explicit property separator
		name = tokens.slice(0, sepIx);
		value = tokens.slice(sepIx + 1);
		separator = tokens[sepIx];
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
		value = splitList(value, commaSeparator)
		.map(item => new FragmentsToken(stream, trimFormatting(item)));
	}

	return new Property(
		new FragmentsToken(stream, trimFormatting(name)),
		value && value.length ? new FragmentsToken(stream, value) : null,
		separator,
		terminator
	);
}

function createRule(stream, tokens, contentStart, contentEnd) {
	tokens = trimFormatting(tokens);
	const selectors = splitList(tokens, commaSeparator)
		.map(item => new FragmentsToken(stream, trimFormatting(item)));

	return new Rule(
		new FragmentsToken(stream, selectors),
		contentStart,
		contentEnd
	);
}

function trimFormatting(tokens) {
	return trimTokens(tokens, isFormattingToken);
}

function isFormattingToken(token) {
	return token.type === 'comment' || token.type === 'whitespace';
}

function commaSeparator(token) {
	return token.comma;
}

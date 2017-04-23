'use strict';

import { fragments } from './tokens/index';
import FunctionToken from './tokens/function';
import { splitList, trimFormatting, commaSeparator } from './utils';

/**
 * Factory method that creates property node from given tokens
 * @param  {StreamReader} stream
 * @param  {Token[]}      tokens
 * @return {Property}
 */
export default function createProperty(stream, tokens) {
	// NB in LESS, fragmented properties without value like `.foo.bar;` must be
	// treated like mixin call
	tokens = trimFormatting(tokens);

	if (!tokens.length) {
		return null;
	}

	// Property terminator should be at the end of token list
	let terminator = tokens[tokens.length - 1].propertyTerminator ? tokens.pop() : null;
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
	} else if (tokens[0] && tokens[0].type === 'at-keyword') {
		// Edge case for properties like `@import "foo";`: treat at-keyword as
		// property name, the rest tokens are value
		name = [tokens[0]];
		value = tokens.slice(1);
	} else {
		// Check for `color:red;` edge case where `:red` is parsed as pseudo-selector
		for (let i = 0; i < tokens.length; i++) {
			if (tokens[i].type === 'pseudo') {
				name = tokens.slice(0, i);
				value = [tokens[i].name].concat(tokens.slice(i + 1));
				break;
			}
		}
	}

	if (value) {
		value = splitList(value, commaSeparator)
		.map(item => fragments(stream, trimFormatting(item)));
	}

	return new Property(
		fragments(stream, trimFormatting(name)),
		value && value.length ? fragments(stream, value) : null,
		separator,
		terminator
	);
}

export class Property {
	constructor(name, value, separator, terminator) {
		this.type = 'property';
		this.nameToken = name;
		this.valueToken = value;

		this.separatorToken = separator;
		this.terminatorToken = terminator;
	}

	get name() {
		return valueOf(this.nameToken);
	}

	get value() {
		return valueOf(this.valueToken);
	}

	get separator() {
		return valueOf(this.separatorToken);
	}

	get terminator() {
		return valueOf(this.terminatorToken);
	}

	get start() {
		return this.nameToken && this.nameToken.start;
	}

	get end() {
		const token = this.terminatorToken || this.valueToken
			|| this.separatorToken || this.nameToken;
		return token && token.end;
	}
}

function valueOf(token) {
	return token && token.valueOf();
}

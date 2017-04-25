'use strict';

import Range from './range';
import { trimFormatting, type, last } from './utils';

/**
 * Factory method that creates property node from given tokens
 * @param  {StreamReader} stream
 * @param  {Token[]}      tokens
 * @param  {Token}        terminator
 * @return {Property}
 */
export default function createProperty(stream, tokens, terminator) {
	// NB in LESS, fragmented properties without value like `.foo.bar;` must be
	// treated like mixin call
	tokens = trimFormatting(tokens);

	if (!tokens.length) {
		return null;
	}

	let name = tokens, value, separator;
	let sepIx = findDelimiterIndex(tokens);

	if (sepIx > 0) {
		// Has explicit property separator, which is not at the beginning
		// of token list
		name = trimFormatting(tokens.slice(0, sepIx));
		value = trimFormatting(tokens.slice(sepIx + 1));
		separator = tokens[sepIx];
	} else if (type(tokens[0]) === 'at-keyword') {
		// Edge case for properties like `@import "foo";`: treat at-keyword as
		// property name, the rest tokens are value
		name = [tokens.shift()];

		// Find separator: should be the first whitespace token
		while (type(tokens[0]) === 'comment') {
			tokens.shift();
		}

		if (type(tokens[0]) === 'whitespace') {
			separator = tokens.shift();
		}

		value = trimFormatting(tokens);
	}

	return new Property(
		stream,
		Range.fromObject(name),
		Range.fromObject(value),
		Range.fromObject(separator),
		Range.fromObject(terminator)
	);
}

export class Property {
	constructor(stream, name, value, separator, terminator) {
		this.type = 'property';
		this.stream = stream;
		this.nameRange = name;
		this.valueRange = value;
		this.separatorRange = separator;
		this.terminatorRange = terminator;
	}

	get name() {
		return valueOf(this.stream, this.nameRange);
	}

	get value() {
		return valueOf(this.stream, this.valueRange);
	}

	get separator() {
		return valueOf(this.stream, this.separatorRange);
	}

	get terminator() {
		return valueOf(this.stream, this.terminatorRange);
	}

	get start() {
		return this.nameRange && this.nameRange.start;
	}

	get end() {
		const range = this.terminatorRange || this.valueRange
			|| this.separatorRange || this.nameRange;
		return token && token.end;
	}
}

function valueOf(stream, range) {
	return range && range.substring(stream);
}

function findDelimiterIndex(tokens) {
	// NB property delimiter should not be at the beginning of token list:
	// otherwise it’s a pseudo-selector or invalid property definition
	for (let i = 1, il = tokens.length; i < il; i++) {
		if (tokens[i].propertyDelimiter) {
			return i;
		}
	}

	return -1;
}

'use strict';

import Token from './tokens/token';
import consumeToken from './tokens/index';
import parseList from './list';
import Node from './node';
import { last } from './utils';

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
	if (!tokens.length) {
		return null;
	}

	let separator, value, ix = 0;
	const name = tokens[ix++];

	if (ix < tokens.length) {
		value = tokens[ix++];
		value.type = 'value';
		value.end = last(tokens).end;
	}

	if (name && value) {
		separator = new Token(stream, 'separator', name.end, value.start);
	}

	return new Property(
		stream,
		name,
		value,
		separator,
		terminator
	);
}

export class Property extends Node {
	constructor(stream, name, value, separator, terminator) {
		super('property');
		this.stream = stream;
		this.nameToken = name;
		this.valueToken = value;
		this._parsedName = null;
		this._parsedValue = null;

		this.separatorToken = separator;
		this.terminatorToken = terminator;
	}

	/**
	 * Property name
	 * @return {String}
	 */
	get name() {
		return valueOf(this.nameToken);
	}

	/**
	 * Returns parsed sub-tokens of current property name
	 * @return {Token[]}
	 */
	get parsedName() {
		// NB The only reason to have parsed name is LESS where pseudo-property
		// (a selector without curly braces) means mixin invocation
		if (!this._parsedName) {
			this._parsedName = [];
			const stream = this.nameToken.limit();

			while (!stream.eof()) {
				this._parsedName.push(consumeToken(stream));
			}
		}

		return this._parsedName;
	}

	/**
	 * Property value
	 * @return {String}
	 */
	get value() {
		return valueOf(this.valueToken);
	}

	/**
	 * Parsed value parts: a list of tokens, separated by comma. Each token may
	 * contains parsed sub-tokens and so on
	 * @return {Token[]}
	 */
	get parsedValue() {
		if (!this._parsedValue) {
			this._parsedValue = parseList(this.valueToken.limit());
		}

		return this._parsedValue;
	}

	get separator() {
		return valueOf(this.separatorToken);
	}

	get terminator() {
		return valueOf(this.terminatorToken);
	}

	get start() {
		const token = this.nameToken || this.separatorToken || this.valueToken
			|| this.terminatorToken;
		return token && token.start;
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

'use strict';

/**
 * A structure describing text fragment in content stream
 */
export class Token {
	/**
	 * @param {StreamReader} stream
	 * @param {Point}        start  Tokens’ start location in content stream
	 * @param {Point}        end    Tokens’ end location in content stream
	 */
	constructor(stream, start, end) {
		this.stream = stream;
		this.start  = start != null ? start : stream.start;
		this.end    = end   != null ? end   : stream.pos;
		this._value = null;
	}

	/**
	 * Returns token textual representation
	 * @return {String}
	 */
	toString() {
		return `${this.valueOf()}: ${this.start}, ${this.end}`;
	}

	valueOf() {
		if (this._value === null) {
			const start = this.stream.start;
			const end = this.stream.pos;

			this.stream.start = this.start;
			this.stream.pos = this.end;
			this._value = this.stream.current();

			this.stream.start = start;
			this.stream.pos = end;
		}

		return this._value;
	}
}

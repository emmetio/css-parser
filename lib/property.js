'use strict';

export default class Property {
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

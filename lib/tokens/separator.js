'use strict';

import Token from './token';

export const COMMA           = 44;  // ,
export const PROP_DELIMITER  = 58;  // :
export const PROP_TERMINATOR = 59;  // ;
export const RULE_START      = 123; // {
export const RULE_END        = 125; // }

/**
 * Consumes separator token from given string
 */
export default function(stream) {
	if (isSeparator(stream.peek())) {
		const start = stream.pos;
		return new SeparatorToken(stream.next(), stream, start);
	}
}

function isSeparator(code) {
	return code === COMMA
		|| code === PROP_DELIMITER || code === PROP_TERMINATOR
		|| code === RULE_START || code === RULE_END;
}

export class SeparatorToken extends Token {
	constructor(code, stream, start, end) {
		super(stream, start, end);
		this.type = 'separator';
		this.code = code;

		this.comma = code === COMMA;
		this.propertyDelimiter = code === PROP_DELIMITER;
		this.propertyTerminator = code === PROP_TERMINATOR;
		this.ruleStart = code === RULE_START;
		this.ruleEnd = code === RULE_END;
	}
}

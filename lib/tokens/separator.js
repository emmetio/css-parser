'use strict';

import Token from './token';
import { consume } from '../utils';

const COMMA           = 44;  // ,
const PROP_DELIMITER  = 58;  // :
const PROP_TERMINATOR = 59;  // ;
const RULE_START      = 123; // {
const RULE_END        = 125; // }

const types = {
	[COMMA]: 'comma',
	[PROP_DELIMITER]: 'propertyDelimiter',
	[PROP_TERMINATOR]: 'propertyTerminator',
	[RULE_START]: 'ruleStart',
	[RULE_END]: 'ruleEnd'
};

/**
 * Consumes separator token from given string
 */
export default function separator(stream) {
	if (isSeparator(stream.peek())) {
		const start = stream.pos;
		const type = types[stream.next()];
		const token = new Token(stream, 'separator', start);

		token.property('type', type);
		return token;
	}
}

export function eatSeparator(stream) {
	return consume(stream, isCombinator);
}

function isSeparator(code) {
	return code === COMMA
		|| code === PROP_DELIMITER || code === PROP_TERMINATOR
		|| code === RULE_START || code === RULE_END;
}

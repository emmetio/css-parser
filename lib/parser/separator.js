'use strict';

/**
 * Check if given character code is any kind of separator
 * @param  {Number} code
 * @return {Boolean}
 */
export default function(code) {
	return isPropertySeparator(code) || isPropertyTerminator(code)
		|| isSectionStart(code) || isSectionEnd(code);
}

export function isSectionStart(code) {
	return code === 123 /* { */;
}

export function isSectionEnd(code) {
	return code === 125 /* { */;
}

export function isPropertySeparator(code) {
	return code === 58 /* : */;
}

export function isPropertyTerminator(code) {
	return code === 59 /* ; */;
}

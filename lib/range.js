'use strict';

export default class Range {
	static fromObject(obj) {
		if (Array.isArray(obj)) {
			if (!obj.length) {
				return null;
			}

			if (obj[0] && typeof obj[0] === 'object' && 'start' in obj[0]) {
				return new Range(obj[0].start, obj[obj.length - 1].end);
			}

			return new Range(obj[0], obj[obj.length - 1]);
		}

		if (obj && typeof obj === 'object') {
			return new Range(obj.start, obj.end);
		}

		return null;
	}

	constructor(start, end) {
		this.start = start;
		this.end = end;
	}

	substring(stream) {
		return stream.substring(this.start, this.end);
	}
}

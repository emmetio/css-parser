export default {
	entry: './index.js',
	external: [
		'@emmetio/stream-reader',
		'@emmetio/stream-reader-utils'
	],
	exports: 'named',
	targets: [
		{format: 'cjs', dest: 'dist/css-parser.cjs.js'},
		{format: 'es',  dest: 'dist/css-parser.es.js'}
	]
};

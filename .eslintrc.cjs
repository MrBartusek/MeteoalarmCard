module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	},
	extends: [
		'plugin:@typescript-eslint/recommended'
	],
	rules: {
		'brace-style': ['error', 'stroustrup', { 'allowSingleLine': true }],
		'quotes': ['error', 'single'],
		'no-trailing-spaces': ['error'],
		'eol-last': ['error', 'always'],
		'curly': ['error', 'multi-line', 'consistent'],
		'indent': ['error', 'tab', { 'SwitchCase': 1, 'ignoredNodes': ['TemplateLiteral *'] }],
		'semi': ['error', 'always'],
		'no-multiple-empty-lines': ['error', { 'max': 1}],
		'comma-dangle': ['error', 'never'],
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-this-alias': 'off',
		'@typescript-eslint/ban-ts-comment': 'off'
	}
};

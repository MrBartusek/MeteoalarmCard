module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: false,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
	],
	ignorePatterns: ['*.json'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'prettier'],
	rules: {
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-this-alias': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'no-console': 'error',
		'prettier/prettier': [
			'error',
			{
				endOfLine: 'auto',
				useTabs: true,
				singleQuote: true,
				printWidth: 100,
				singleAttributePerLine: true,
			},
		],
	},
};

import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
	globalIgnores(['dist/', 'tools/dist/', 'hass-dev/config/']),
	js.configs.recommended,
	{
		files: ['**/*.ts'],
		extends: [tseslint.configs.recommended],
		languageOptions: { globals: globals.browser },
		rules: {
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-this-alias': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-unsafe-declaration-merging': 'off',
		},
	},
	prettierRecommended,
	{
		rules: {
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
	},
	{
		files: ['hass-dev/**/*.ts'],
		languageOptions: { globals: globals.node },
		rules: { 'no-console': 'off' },
	},
]);

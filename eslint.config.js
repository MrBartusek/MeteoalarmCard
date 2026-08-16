import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
	globalIgnores(['dist/', 'tools/dist/', 'hass-dev/config/', '**/*.json']),
	{
		files: ['**/*.ts'],
		extends: [js.configs.recommended, tseslint.configs.recommended, prettierRecommended],
		languageOptions: {
			sourceType: 'module',
			globals: { ...globals.browser, ...globals.es2021 },
		},
		rules: {
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-this-alias': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-unsafe-declaration-merging': 'off',
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
	{
		files: ['eslint.config.js'],
		extends: [js.configs.recommended, prettierRecommended],
		languageOptions: { globals: globals.node },
		rules: {
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
]);

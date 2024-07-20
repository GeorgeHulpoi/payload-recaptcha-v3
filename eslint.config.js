import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';

export default [
	{ languageOptions: { globals: globals.browser } },
	...tseslint.configs.recommended,
	{
		files: ['**/*.jsx'],
		languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
	},
	pluginReactConfig,
];

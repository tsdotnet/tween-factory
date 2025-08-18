import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		rules: {
			"semi": "off",
			"indent": ["warn", "tab", { "SwitchCase": 1 }],
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/no-this-alias": "off"
		},
		files: ['src/**/*.ts'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				console: 'readonly',
				process: 'readonly'
			}
		}
	}
);

import globals from 'globals';
import pluginJs from '@eslint/js';

const rules = { ...pluginJs.configs.recommended.rules };
rules['no-unused-vars'] = [
    'warn',
    {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
    }
];
rules.eqeqeq = ['error', 'always'];
export default [{ languageOptions: { globals: globals.node } }, { rules }];

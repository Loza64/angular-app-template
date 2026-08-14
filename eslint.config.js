// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    // Directorios/archivos que ESLint no debe tocar en absoluto.
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.angular/**', '**/*.spec.ts'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Convenciones de nombres de selector del proyecto (prefijo "app").
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],

      // El proyecto usa muchos "any" controlados en la capa de SDK/HTTP;
      // se deja como warning en vez de error para no bloquear el trabajo
      // diario, pero sí debe verse.
      '@typescript-eslint/no-explicit-any': 'warn',

      // Variables sin usar: sí bloquea el commit, pero permite prefijar
      // con "_" cuando es intencional (p. ej. parámetros de callback).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },
);

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',

    ecmaFeatures: {
      jsx: true,
    },
  },
  root: true,
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          Function: false,
          Object: false,
        },
      },
    ],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-inferrable-types': [
      'off',
      {
        ignoreParameters: false,
        ignoreProperties: false,
      },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    'prefer-const': ['error', { destructuring: 'all' }],
    'no-console': 'off',
  },
  ignorePatterns: [
    '.next/**',
    'node_modules/**',
    'build/**',
    'out/**',
    'dist/**',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
};

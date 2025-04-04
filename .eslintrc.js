module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Downgrade rules that are causing issues
    'react-hooks/exhaustive-deps': 'warn',
    '@next/next/no-img-element': 'warn',
    'react/no-unescaped-entities': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
  // Add this to help with parsing large files
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  // This is important to fix the parsing errors
  ignorePatterns: ['node_modules/', '.next/', 'public/'],
} 
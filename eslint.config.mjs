import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/**
 * ESLint 9 flat config. eslint-config-next v16 ships native flat configs, so
 * they are spread directly rather than bridged through FlatCompat.
 */
const config = [
  { ignores: ['.next/**', 'node_modules/**', '.data/**', 'drizzle/**', 'next-env.d.ts'] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];

export default config;

module.exports = {
  plugins: ['eslint-plugin-prettier'],
  env: {
    node: true,
  },
  extends: ['standard', 'plugin:prettier/recommended', 'prettier'],
  rules: {
    'prettier/prettier': ['error'],
    'max-len': [
      'error',
      {
        code: 120,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
  },
};

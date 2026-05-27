module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
      'inventory', 'finance', 'staff', 'personal', 'auth', 'shared', 'infra', 'ui', 'docs'
    ]]
  }
};

module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        'standard'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    rules: {
        'no-new': 'off',
        'no-useless-escape': 'off',
        indent: ['error', 4, {
            SwitchCase: 1
        }]
    }
}

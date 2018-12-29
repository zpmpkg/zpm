module.exports = function(w) {
    return {
        files: [
            'tsconfig.json',
            'package.json',
            'src/**/*.ts',
            'src/**/*.json',
            '!src/**/*.spec.ts',
            '!src/**/*.d.ts',
        ],

        tests: ['src/**/*.spec.ts'],

        env: {
            type: 'node',
        },

        testFramework: 'jest',
        compilers: {
            '**/*.ts': w.compilers.typeScript({ isolatedModules: true, module: 'commonjs' }),
        },

        setup: function(wallaby) {
            var jestConfig = require('./package.json').jest
            wallaby.testFramework.configure(jestConfig)
        },
    }
}

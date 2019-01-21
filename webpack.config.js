const path = require('path')
const webpack = require('webpack')

module.exports = {
    entry: './src/main.ts',
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            '@zpm': path.resolve('.', 'src'),
        },
    },
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname, 'build'),
        filename: '[name].js',
    },
    mode: 'requires',
    devtool: 'inline-source-map',
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['cache-loader', 'ts-loader'],
            },
            {
                test: /^src\/.*\.json$/,
                use: ['raw-loader'],
            },
        ],
    },
    optimization: {
        minimize: false,
    },
    plugins: [new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)],
}

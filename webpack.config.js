const path = require('path')
const webpack = require('webpack')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
    entry: './src/main.ts',
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        plugins: [
            new TsconfigPathsPlugin({
                /*configFile: "./path/to/tsconfig.json" */
            }),
        ],
    },
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname, 'build'),
        filename: '[name].js',
    },
    mode: 'production',
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
    plugins: [new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/, /winston$/)],
}

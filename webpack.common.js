const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./index.js",
    plugins: [
        new HtmlWebpackPlugin({title: "Egypt Population"}),
        new webpack.EnvironmentPlugin(["MapboxAccessToken"])
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.csv$/,
                exclude: /node_modules/,
                loader: "csv-loader"
            }
        ]
    }
}

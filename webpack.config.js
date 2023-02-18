const path = require("path");
const FortTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	mode: "development",
	devtool: "inline-source-map",
	entry: "./src/main.ts",
	target: "es2020",
	output: {
		filename: "main.js",
		path: path.resolve(process.cwd(), "build"),
		chunkFormat: "module",
		clean: true
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	plugins: [
		new FortTsCheckerWebpackPlugin(),
		new HtmlWebpackPlugin({
			title: "Quick Webpack Template",
			template: "./src/index.html",
			scriptLoading: "module"
		})
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: /node_modules/,
				options: {
					configFile: "tsconfig.json",
					transpileOnly: true
				}
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
			},
			{
				test: /\.(ogg|mp3|flac|wav)$/i,
				type: 'asset/resource',
			}
		]
	},
	stats: {
		errorDetails: true
	}
}
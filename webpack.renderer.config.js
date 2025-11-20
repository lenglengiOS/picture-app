const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/renderer/index.jsx",
  output: {
    path: path.resolve(__dirname, "src/renderer"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      "@src": path.resolve(__dirname, "./src"),
    },
  },
};

const path = require("path");
module.exports = {
  mode: "production",
  entry: ["./out/index.js"],
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "lwjsk.js",
    libraryTarget: "umd",
    globalObject: "this",
  },
};

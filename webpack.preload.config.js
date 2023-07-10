module.exports = {
  entry: "./src/preload.js",
  output: {
    path: __dirname,
    filename: "preload.js",
  },
  target: "electron-preload",
};

const { defineConfig } = require("tsup");

module.exports = defineConfig({
  clean: true,
  bundle: true,
  outDir: "build",
  target: "node14",
  platform: "node",
  sourcemap: true,
  entry: ["src/index.ts"],
});

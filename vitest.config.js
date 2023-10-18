const { resolve } = require("path");
const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});

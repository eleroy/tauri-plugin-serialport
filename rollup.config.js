import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "guest-js/index.ts",
  output: {
    dir: "./dist-js",
    entryFileNames: "[name].js",
    format: "es",
    exports: "auto",
  },
  plugins: [
    nodeResolve(),
    terser(),
    typescript({
      declaration: true,
      declarationDir: "./dist-js",
      moduleResolution: "node",
    }),
  ],
};

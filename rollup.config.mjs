import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";

/** @type {import('rollup').RollupOptions} */
export default {
    input: "dist/bin/cli.js",
    output: {
        file: "dist/bundle.js",
        format: "cjs",
        inlineDynamicImports: true
    },
    plugins: [
        nodeResolve({ extensions: [".ts"] }),
        json(),
        commonjs()
    ],
};

import esbuild from "rollup-plugin-esbuild";

export default {
  input: `dist/lib/minewt.js`,
  output: [
    {
      file: `dist/minewt.cjs`,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: `dist/minewt.es.js`,
      format: "es",
      sourcemap: true,
    },
  ],
  plugins: [
    esbuild({
      minify: true,
    }),
  ],
};

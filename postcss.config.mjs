/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    "@tailwindcss/postcss": {
      config: new URL("./tailwind.config.js", import.meta.url),
    },
  },
}

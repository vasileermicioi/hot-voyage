import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

// Astro 7: `output: "hybrid"` was removed. `output: "static"` (the default)
// behaves the same way — pages prerender, and routes under src/pages/api/*
// opt back into server rendering with `export const prerender = false`.
// https://docs.astro.build/en/guides/integrations-guide/cloudflare/
export default defineConfig({
  output: "static",
  adapter: cloudflare({
    imageService: "compile",
  }),
  image: {
    formats: ["webp"],
  },
});

// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "https://www.sirkorgo.com",
  integrations: [
    sitemap({
      filter: (page) => !/\/\d{4}\/\d{2}\/\d{2}\//.test(page),
    }),
  ],
});

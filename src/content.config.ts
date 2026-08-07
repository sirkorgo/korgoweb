import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const art = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/art" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    image: z.string(),
    layout: z.string().optional(),
  }),
});

const comics = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/comics" }),
  schema: z.object({
    title: z.string(),
    series: z.string(),
    chapter: z.coerce.number(),
    date: z.coerce.date(),
    layout: z.string().optional(),
  }),
});

const changelogs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/changelogs" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    author: z.string().optional(),
  }),
});

export const collections = {
  art,
  comics,
  changelogs,
  posts,
};

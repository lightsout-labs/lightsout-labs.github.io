import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const articles = defineCollection({
  // Ids are `<lang>/<slug>`, which the series model splits.
  loader: glob({ pattern: "{en,zh}/*.md", base: "src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    part: z.number().int().min(1).max(12),
  }),
});

export const collections = { articles };

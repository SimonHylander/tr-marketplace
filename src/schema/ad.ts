import { z } from "zod";

export const createAdSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  enableTreddy: z.boolean(),
});

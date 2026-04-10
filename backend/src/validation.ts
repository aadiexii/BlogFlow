import { z } from "zod";

export const signupInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().optional(),
});

export const signinInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createPostInput = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export const updatePostInput = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  content: z.string().min(1),
});

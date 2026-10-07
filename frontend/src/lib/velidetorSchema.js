import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  fullname: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(13, "Username must be at most 13 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscore allowed"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  avatar: z.any().refine((f) => !f || f.size <= 2 * 1024 * 1024, "Avatar must be under 2MB"),
});

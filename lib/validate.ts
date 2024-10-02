import { z } from "zod";

export const emailSchema = z
  .string({
    invalid_type_error: "invalid email",
  })
  .email();

export const validateEmail = (email: string): boolean =>
  emailSchema.safeParse(email).success;

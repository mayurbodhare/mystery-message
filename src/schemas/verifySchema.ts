import { z } from "zod";

export const verifySchema = z.object({
    code : z.string().min(6, "Verification Code must be of 6 digits.")
})
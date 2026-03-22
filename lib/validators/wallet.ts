import { z } from "zod";

export const walletSchema = z.object({
  walletAddress: z
    .union([z.string(), z.null()])
    .transform((value) => (typeof value === "string" ? value.trim() : value))
    .refine((value) => value === null || value === "" || value.startsWith("0x"), {
      message: "Wallet address must start with 0x or be left blank."
    })
    .transform((value) => (value === "" ? null : value))
});

export type WalletInput = z.output<typeof walletSchema>;

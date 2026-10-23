import { CurrencyCode } from "@prisma/client";
import { z } from "zod";

/** Manter alinhado com `i18n/routing` (next-intl). */
const UI_LOCALES = ["en", "de", "pt", "hi", "ar"] as const;

export const portalAuthBodySchema = z
  .object({
    key: z.string().max(8192).optional(),
    licenseToken: z.string().max(65536).optional(),
    licenseId: z.string().max(512).optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    const k = val.key?.trim() ?? "";
    const t = val.licenseToken?.trim() ?? "";
    const id = val.licenseId?.trim() ?? "";
    if (k.length === 0 && t.length === 0 && id.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide at least one of: key, licenseToken, licenseId.",
        path: ["key"],
      });
    }
  });

export const vaultUnlockBodySchema = z
  .object({
    accessKey: z.string().min(1).max(512),
  })
  .strict();

export const clientAccessBodySchema = z
  .object({
    formulaId: z
      .string()
      .min(1)
      .max(128)
      .regex(/^[a-zA-Z0-9_-]+$/u, "formulaId must be alphanumeric with _ or -"),
  })
  .strict();

export const requestLicenseBodySchema = z
  .object({
    company: z.string().min(1).max(500),
    country: z.string().min(1).max(200),
    corporateEmail: z.string().email().max(320),
    currencyCode: z.nativeEnum(CurrencyCode).optional(),
    uiLocale: z.enum(UI_LOCALES).optional(),
  })
  .strict();

export const ceoAuthBodySchema = z
  .object({
    email: z.string().email().max(320),
    password: z.string().min(1).max(500),
  })
  .strict();

export const supportTicketBodySchema = z
  .object({
    subject: z.string().min(3).max(200),
    body: z.string().min(10).max(8000),
    priority: z.enum(["low", "normal", "high"]).optional().default("normal"),
    requesterEmail: z.string().email().max(320),
    requesterName: z.string().max(200).nullable().optional(),
    uiLocale: z.enum(UI_LOCALES).optional(),
  })
  .strict();

export const ceoMfaVerifyBodySchema = z
  .object({
    totp: z.string().max(12).optional(),
    emailCode: z.string().max(12).optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    const t = val.totp?.trim() ?? "";
    const e = val.emailCode?.trim() ?? "";
    if (t.length === 0 && e.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Provide totp or emailCode.", path: ["totp"] });
    }
  });

const MFA_OVERRIDE_PART = z.enum(["totp", "email"]);

export const adminProfilePatchBodySchema = z
  .object({
    currentPassword: z.string().min(1).max(500),
    newPassword: z.string().min(12).max(500).optional(),
    /** `null` limpa override (volta ao env). `off` grava override explícito desligado. */
    adminMfaModeOverride: z.union([z.string().max(48), z.null()]).optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    const hasPw = Boolean(val.newPassword?.length);
    const hasMfa = val.adminMfaModeOverride !== undefined;
    if (!hasPw && !hasMfa) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide newPassword and/or adminMfaModeOverride.",
        path: ["newPassword"],
      });
    }
    if (val.adminMfaModeOverride != null && typeof val.adminMfaModeOverride === "string") {
      const raw = val.adminMfaModeOverride.trim().toLowerCase();
      if (raw && raw !== "off") {
        const parts = raw.split(/[|,]+/).map((s) => s.trim()).filter(Boolean);
        const parsed = z.array(MFA_OVERRIDE_PART).safeParse(parts);
        if (!parsed.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "adminMfaModeOverride must be off, totp, email, or totp|email (order matters).",
            path: ["adminMfaModeOverride"],
          });
        }
      }
    }
  });

export const adminProfileTotpStartBodySchema = z
  .object({
    currentPassword: z.string().min(1).max(500),
  })
  .strict();

export const adminProfileTotpVerifyBodySchema = z
  .object({
    code: z.string().min(6).max(12),
  })
  .strict();

const PLAN_TIER = z.enum(["standard", "enterprise", "global"]);

export const salesPulseBodySchema = z
  .object({
    plan: PLAN_TIER,
  })
  .strict();

export const checkoutPlanBodySchema = z
  .object({
    plan: PLAN_TIER,
    currency: z.enum(["USD", "EUR", "BRL"]).optional(),
    /** Usado em URLs de retorno Stripe (página de sucesso localizada). */
    locale: z.enum(UI_LOCALES).optional(),
  })
  .strict();

export const internalSecurityEventBodySchema = z
  .object({
    type: z.string().min(1).max(96),
    title: z.string().min(1).max(256),
    severity: z.enum(["INFO", "WARNING", "CRITICAL"]).optional(),
    detail: z.string().max(2000).nullable().optional(),
    requestPath: z.string().max(512).nullable().optional(),
    requestId: z.string().max(64).nullable().optional(),
    ip: z.string().max(64).optional(),
    userAgent: z.string().max(512).optional(),
    region: z.string().max(32).optional(),
  })
  .strict();

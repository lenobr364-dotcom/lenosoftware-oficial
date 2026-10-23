export type AcceptIntlTermsState = {
  ok: boolean;
  error?: "must_agree" | "server";
  transactionCode?: string;
};

/** Initial state for `useActionState` — keep outside `"use server"` modules so the client can import it. */
export const INITIAL_ACCEPT_INTL_TERMS_STATE: AcceptIntlTermsState = { ok: false };

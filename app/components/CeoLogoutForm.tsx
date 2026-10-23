"use client";

import { logoutCeo } from "@/actions/ceo-auth";
import { glassButton } from "@/lib/ui-glass";
type CeoLogoutFormProps = {
  locale: string;
  label: string;
  /** Merges with default button styles (layout shell, mobile bar, etc.). */
  buttonClassName?: string;
};

export function CeoLogoutForm({ locale, label, buttonClassName }: CeoLogoutFormProps) {
  const defaultBtn = `${glassButton} rounded-full px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-neutral-300`;
  return (
    <form action={logoutCeo} className="inline-flex w-full max-w-full justify-center">
      <input type="hidden" name="locale" value={locale} />
      <button type="submit" className={buttonClassName ? buttonClassName : defaultBtn}>
        {label}
      </button>
    </form>
  );
}

"use client";

import { maskContactText } from "@/lib/britagrid/contact-sanitize";

type Props = {
  text: string;
  released?: boolean;
  className?: string;
};

/** Renderiza texto com mascaramento client-side (segunda camada; API já sanitiza). */
export function MaskedText({ text, released = false, className }: Props) {
  const display = released ? text : maskContactText(text).sanitized;
  return <span className={className}>{display}</span>;
}

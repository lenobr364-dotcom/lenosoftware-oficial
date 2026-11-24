"use client";

import { maskContactText } from "@/lib/anti-disintermediation/contact-sanitize";

type Props = {
  text: string;
  released?: boolean;
  className?: string;
};

/** Exibe texto mascarando contatos até liberação formal. */
export function MaskedText({ text, released = false, className }: Props) {
  const display = released ? text : maskContactText(text).sanitized;
  return <span className={className}>{display}</span>;
}

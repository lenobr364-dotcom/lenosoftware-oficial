"use client";

import { ChemVaultPageBackdrop } from "@/app/components/ChemVaultPageBackdrop";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function VaultNotFound() {
  const t = useTranslations("NotFound");

  return (
    <main className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-black px-6 py-20 text-white">
      <ChemVaultPageBackdrop tone="gate" />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-lg text-center"
      >
        <p className="text-[0.7rem] uppercase tracking-[0.42em] text-yellow-400/75">{t("eyebrow")}</p>
        <h1
          className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl"
          style={{ textShadow: "0 0 20px rgba(253,224,71,0.18)" }}
        >
          {t("title")}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-gray-300 md:text-lg">{t("message")}</p>
        <Link
          href="/"
          className="mt-10 inline-flex items-center justify-center rounded-full border border-yellow-500/35 bg-yellow-500/10 px-7 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-yellow-100/95 shadow-[0_0_28px_rgba(234,179,8,0.12)] transition-all duration-300 ease-out hover:border-yellow-400/55 hover:bg-yellow-500/18 hover:shadow-[0_0_36px_rgba(234,179,8,0.2)]"
        >
          {t("backHome")}
        </Link>
      </motion.div>
    </main>
  );
}

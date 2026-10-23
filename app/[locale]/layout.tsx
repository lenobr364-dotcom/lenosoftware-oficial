import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { BijuToaster } from "@/app/components/BijuToaster";
import { LocaleHtmlAttributes } from "@/app/components/LocaleHtmlAttributes";
import { isRtlLocale, routing } from "@/i18n/routing";
import { locales } from "@/i18n";

const localeSeo: Record<string, { title: string; description: string; ogLocale: string }> = {
  en: {
    title: "ChemVault Global | Industrial chemical licensing",
    description:
      "ChemVault Global — industrial formulations, international licensing infrastructure, and executive-grade vault operations for partners in the Americas, Europe, India, and Arabic markets.",
    ogLocale: "en_US",
  },
  de: {
    title: "ChemVault Global | Industrielle Chemielizenzen",
    description:
      "ChemVault Global — industrielle Formulierungen, internationale Lizenzinfrastruktur und Executive-Vault für Partner in Europa und weltweit.",
    ogLocale: "de_DE",
  },
  pt: {
    title: "ChemVault Global | Licenciamento químico industrial",
    description:
      "ChemVault Global — formulações industriais, infraestrutura internacional de licenciamento e cofre executivo para parceiros no Brasil e mercados globais.",
    ogLocale: "pt_BR",
  },
  hi: {
    title: "ChemVault Global | औद्योगिक रसायन लाइसेंसिंग",
    description:
      "ChemVault Global — औद्योगिक फॉर्मूलेशन, अंतर्राष्ट्रीय लाइसेंसिंग अवसंरचना और कार्यकारी वॉल्ट संचालन।",
    ogLocale: "hi_IN",
  },
  ar: {
    title: "ChemVault Global | ترخيص كيميائي صناعي",
    description:
      "ChemVault Global — تركيبات صناعية، وبنية ترخيص دولية، وتشغيل خزنة على مستوى تنفيذي للأسواق العربية والعالمية.",
    ogLocale: "ar_SA",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const c = localeSeo[locale] ?? localeSeo.en;
  const languages: Record<string, string> = Object.fromEntries(routing.locales.map((l) => [l, `${baseUrl}/${l}`]));
  languages["x-default"] = `${baseUrl}/en`;

  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages,
    },
    openGraph: {
      title: c.title,
      description: c.description,
      url: `${baseUrl}/${locale}`,
      siteName: "ChemVault Global",
      locale: c.ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: c.title,
      description: c.description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <LocaleHtmlAttributes />
      <BijuToaster />
      <div
        className="flex min-h-full flex-1 flex-col bg-neutral-950 font-mono text-neutral-100 antialiased selection:bg-emerald-500 selection:text-black"
        dir={isRtlLocale(locale) ? "rtl" : "ltr"}
      >
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </NextIntlClientProvider>
  );
}

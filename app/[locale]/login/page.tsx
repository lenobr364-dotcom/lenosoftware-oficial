import { redirect } from "next/navigation";
import { Suspense } from "react";

import { isCeoAuthenticated } from "@/lib/ceo-session-server";

import { LoginForm } from "./LoginForm";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (await isCeoAuthenticated()) {
    redirect(`/${locale}/laboratorio`);
  }

  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

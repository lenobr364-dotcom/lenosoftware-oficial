import { NexusGeminiLabPanel } from "@/components/nexus/NexusGeminiLabPanel";
import { isCeoAuthenticated } from "@/lib/ceo-session-server";
import { redirect } from "next/navigation";

export default async function GeminiLabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await isCeoAuthenticated())) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 md:py-10">
      <NexusGeminiLabPanel />
    </div>
  );
}

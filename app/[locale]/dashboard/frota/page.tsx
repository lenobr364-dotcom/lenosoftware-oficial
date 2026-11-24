import { FrotaComercialClient } from "@/components/comercial/FrotaComercialClient";
import { isCeoAuthenticated } from "@/lib/ceo-session-server";
import { listProposals, listPublicEquipment } from "@/lib/comercial/store";
import { redirect } from "next/navigation";

export default async function FrotaComercialPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(await isCeoAuthenticated())) {
    redirect(`/${locale}/login`);
  }

  const initialEquipment = listPublicEquipment();
  const initialProposals = listProposals();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070c] px-5 py-10 text-white md:px-10 md:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(30,40,60,0.45),_transparent_50%)]"
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <FrotaComercialClient
          locale={locale}
          initialEquipment={initialEquipment}
          initialProposals={initialProposals}
        />
      </div>
    </main>
  );
}

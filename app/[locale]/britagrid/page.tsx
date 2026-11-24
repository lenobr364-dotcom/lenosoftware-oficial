import { BritagridMarketplaceClient } from "@/components/britagrid/BritagridMarketplaceClient";
import { listProposals, listPublicEquipment } from "@/lib/britagrid/store";

export default async function BritagridPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const initialEquipment = listPublicEquipment();
  const initialProposals = listProposals();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070c] px-5 py-10 text-white md:px-10 md:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(30,40,60,0.45),_transparent_50%)]"
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <BritagridMarketplaceClient
          locale={locale}
          initialEquipment={initialEquipment}
          initialProposals={initialProposals}
        />
      </div>
    </main>
  );
}

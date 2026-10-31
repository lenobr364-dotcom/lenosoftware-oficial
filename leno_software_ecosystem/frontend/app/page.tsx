import dynamic from "next/dynamic";

const Console = dynamic(() => import("./console"), {
  ssr: false,
  loading: () => (
    <main className="px-6 py-12 text-sm text-zinc-400">A carregar o console…</main>
  ),
});

export default function HomePage() {
  return <Console />;
}

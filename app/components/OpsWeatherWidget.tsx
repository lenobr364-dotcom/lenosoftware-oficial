const BASES = [
  {
    city: "Cuiabá",
    state: "MT",
    tempC: 32,
    conditionKey: "partlyCloudy" as const,
  },
  {
    city: "Barra do Garças",
    state: "MT",
    tempC: 29,
    conditionKey: "clearHot" as const,
  },
];

type OpsWeatherCopy = {
  title: string;
  footnote: string;
  partlyCloudy: string;
  clearHot: string;
};

function conditionLabel(key: (typeof BASES)[number]["conditionKey"], copy: OpsWeatherCopy) {
  return key === "partlyCloudy" ? copy.partlyCloudy : copy.clearHot;
}

export function OpsWeatherWidget({ copy }: { copy: OpsWeatherCopy }) {
  return (
    <div className="min-w-[12rem] rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-cyan-500/5 px-5 py-4 text-left shadow-[0_0_32px_rgba(14,165,233,0.12)] backdrop-blur-md transition-[border-color,box-shadow] duration-300 ease-out hover:border-sky-400/35 hover:shadow-[0_0_40px_rgba(14,165,233,0.18)]">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-sky-200/90">{copy.title}</p>
      <ul className="mt-3 space-y-2.5">
        {BASES.map((b) => (
          <li key={b.city} className="flex flex-col gap-0.5 border-b border-white/5 pb-2 last:border-0 last:pb-0">
            <span className="text-xs font-medium text-white">
              {b.city}
              <span className="text-gray-500"> · {b.state}</span>
            </span>
            <span className="text-[0.7rem] text-sky-100/80">
              {b.tempC}°C · {conditionLabel(b.conditionKey, copy)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[0.6rem] uppercase tracking-[0.18em] text-gray-500">{copy.footnote}</p>
    </div>
  );
}

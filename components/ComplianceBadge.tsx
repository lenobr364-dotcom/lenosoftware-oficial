"use client";

import { checkCompliance, type Ingredient } from "@/lib/chemistry/compliance";

interface Props {
  ingredients: Ingredient[];
}

export default function ComplianceBadge({ ingredients }: Props) {
  const { isCompliant, violations } = checkCompliance(ingredients);

  return (
    <div
      className={`mt-4 rounded-xl border p-3 backdrop-blur-md transition-all duration-500 ${
        isCompliant
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : "border-red-500/20 bg-red-500/10 text-red-400"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 animate-pulse rounded-full ${isCompliant ? "bg-emerald-400" : "bg-red-400"}`}
        />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {isCompliant ? "Global Compliance: Approved" : "Global Compliance: Alert"}
        </span>
      </div>

      {!isCompliant && (
        <div className="mt-2 text-[9px] leading-tight opacity-80">
          {violations.map((v) => (
            <p key={`${v.ingredient}-${v.current}`}>
              • {v.ingredient}: {v.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

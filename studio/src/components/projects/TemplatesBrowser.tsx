"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { TEMPLATES } from "@/lib/templates";
import { TemplateCard } from "./TemplateCard";

export function TemplatesBrowser({ category }: { category?: string }) {
  const cats = ["All", ...new Set(TEMPLATES.map((t) => t.category))];
  const [cat, setCat] = useState(category ?? "All");
  const list = TEMPLATES.filter((t) => cat === "All" || t.category === cat);
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn("rounded-full border px-3 py-1 text-xs transition", cat === c ? "border-accent/50 bg-accent/15 text-white" : "border-white/[0.08] text-ink-300 hover:text-white")}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <TemplateCard key={t.id} t={t} />
        ))}
      </div>
    </div>
  );
}

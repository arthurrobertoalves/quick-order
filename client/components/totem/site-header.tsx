import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function SiteHeader({
  backHref = "/",
  backLabel = "Início",
  step,
}: {
  backHref?: string;
  backLabel?: string;
  step?: 1 | 2 | 3;
}) {
  return (
    <header className="bg-primary text-primary-foreground flex items-center justify-between gap-3 px-4 py-3 shadow-md">
      <Link
        href={backHref}
        className="flex h-11 items-center gap-1 rounded-full bg-white/20 pr-4 pl-3 text-base font-bold active:scale-95"
      >
        <ArrowLeft className="size-5" /> {backLabel}
      </Link>
      <span className="text-xl font-black tracking-tight">Quick Order 🍔</span>
      {step ? (
        <div className="flex gap-1.5" aria-label={`Etapa ${step} de 3`}>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-2.5 w-6 rounded-full ${n <= step ? "bg-yellow-300" : "bg-white/30"}`}
            />
          ))}
        </div>
      ) : (
        <span className="w-11" />
      )}
    </header>
  );
}

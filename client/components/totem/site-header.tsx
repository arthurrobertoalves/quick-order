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
    <header className="bg-primary text-primary-foreground flex items-center justify-between gap-3 px-4 py-3">
      <Link
        href={backHref}
        className="flex h-10 items-center gap-1 rounded-full bg-white/15 pr-4 pl-3 text-sm font-medium active:opacity-80"
      >
        <ArrowLeft className="size-4" /> {backLabel}
      </Link>
      <span className="text-base font-semibold tracking-tight">Quick Order</span>
      {step ? (
        <div className="flex gap-1.5" aria-label={`Etapa ${step} de 3`}>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-2 w-5 rounded-full ${n <= step ? "bg-white" : "bg-white/25"}`}
            />
          ))}
        </div>
      ) : (
        <span className="w-10" />
      )}
    </header>
  );
}

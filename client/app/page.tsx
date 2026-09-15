import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Bem-vindo!</h1>
        <p className="text-muted-foreground text-lg">O que você deseja?</p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Button asChild size="lg" className="h-16 text-lg">
          <Link href="/menu?tab=combos">Ver Combos</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-16 text-lg">
          <Link href="/menu?tab=lanches">Fazer meu pedido</Link>
        </Button>
      </div>
    </main>
  );
}

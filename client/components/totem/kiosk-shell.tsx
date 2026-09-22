"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCart } from "@/contexts/cart-context";
import { KioskPortalContext } from "./kiosk-portal";

const IDLE_MS = 60_000;
const COUNTDOWN_S = 15;

export function KioskShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { clear, lines } = useCart();
  const [warning, setWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_S);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const watching = pathname !== "/" && !pathname.startsWith("/confirmation");

  const restart = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (!watching) return;
    idleTimer.current = setTimeout(() => {
      setSecondsLeft(COUNTDOWN_S);
      setWarning(true);
    }, IDLE_MS);
  }, [watching]);

  useEffect(() => {
    restart();
    const events = ["pointerdown", "keydown", "scroll"] as const;
    const handler = () => {
      if (!warning) restart();
    };
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [restart, warning]);

  useEffect(() => {
    if (!warning) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setWarning(false);
          clear();
          router.replace("/");
          return COUNTDOWN_S;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [warning, clear, router]);

  const [frame, setFrame] = useState<HTMLDivElement | null>(null);

  return (
    <div className="flex min-h-dvh justify-center bg-neutral-900">
      <div
        ref={setFrame}
        className="bg-background relative flex h-dvh w-full max-w-[calc(100dvh*9/16)] flex-col overflow-hidden shadow-2xl"
        style={{ transform: "translateZ(0)" }}
      >
        <KioskPortalContext.Provider value={frame}>{children}</KioskPortalContext.Provider>
      </div>

      <AlertDialog open={warning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ainda está aí?</AlertDialogTitle>
            <AlertDialogDescription>
              {lines.length > 0
                ? `Seu pedido será cancelado em ${secondsLeft}s por inatividade.`
                : `Voltando ao início em ${secondsLeft}s.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="h-12 text-base"
              onClick={() => {
                setWarning(false);
                clear();
                router.replace("/");
              }}
            >
              Cancelar pedido
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-12 text-base"
              onClick={() => {
                setWarning(false);
                restart();
              }}
            >
              Continuar pedindo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

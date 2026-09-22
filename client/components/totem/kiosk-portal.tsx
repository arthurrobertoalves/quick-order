"use client";

import { createContext, useContext } from "react";

export const KioskPortalContext = createContext<HTMLElement | null>(null);

export function useKioskContainer() {
  return useContext(KioskPortalContext);
}

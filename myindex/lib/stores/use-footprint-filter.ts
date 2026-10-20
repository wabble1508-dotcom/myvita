"use client";

import { create } from "zustand";
import type { FootprintCategory } from "@/lib/domain/types";

type FilterState = {
  category: FootprintCategory | "ALL";
  toggleCategory: (category: FootprintCategory) => void;
  clear: () => void;
};

export const useFootprintFilter = create<FilterState>((set, get) => ({
  category: "ALL",
  toggleCategory: (category) =>
    set({ category: get().category === category ? "ALL" : category }),
  clear: () => set({ category: "ALL" }),
}));

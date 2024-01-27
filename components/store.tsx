import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Store {
  query: string;
  data: any;
  loaded: boolean;
  setQuery: (query: string) => void;
  setData: (data: any) => void;
  setLoaded: (loaded: boolean) => void;
}

export const useStore = create<Store>()(
  persist((set) => ({
    query: "",
    data: [],
    loaded: false,
    setQuery: (query: string) => set({ query }),
    setData: (data: any) => set({ data }),
    setLoaded: (loaded: boolean) => set({ loaded }),
  }),
  {
    name: "search",
  }
  )
);

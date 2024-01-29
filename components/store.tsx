import { InfiniteData } from "@tanstack/react-query";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PermStore {
  permquery: string;
  cachedData: CachedData;
  setpermquery: (permquery: string) => void;
  setCachedData: (cachedData: CachedData) => void;
}
interface Store {
  query: string;
  loaded: boolean;
  setLoaded: (loaded: boolean) => void;
  setQuery: (query: string) => void;
}

type ApiResponse = {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
};

type CachedData = {
  pages: ApiResponse[];
  pageParams: number[];
};

type Movie = {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

export const permUseStore = create<PermStore>()(
  persist(
    (set) => ({
      permquery: "",
      cachedData: {
        pages: [],
        pageParams: [],
      },
      setpermquery: (permquery: string) => set({ permquery }),
      setCachedData: (cachedData: CachedData) => set({ cachedData }),
    }),
    {
      name: "search",
    }
  )
);

export const useStore = create<Store>((set) => ({
  query: "",
  loaded: false,
  setLoaded: (loaded: boolean) => set({ loaded }),
  setQuery: (query: string) => set({ query }),
}));

"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMovies } from "@/server/api";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Searchbar from "@/components/Searchbar";
import { permUseStore, useStore } from "@/components/store";
import axios from "axios";
import Image from "next/image";
import { unknown } from "zod";
import mdbIcon from "@/public/mdbIcon.jpeg";
import nextIcon from "@/public/nextIcon.png";
import reactQueryIcon from "@/public/reactQueryIcon.png";
import zustandIcon from "@/public/zustandIcon.png";
import shadcnIcon from "@/public/shadcnIcon.png";
import { StaticImageData } from "next/image";

const images : StaticImageData[] = [mdbIcon, nextIcon, reactQueryIcon, zustandIcon, shadcnIcon];

//types needed for API
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

type CachedData = {
  pages: ApiResponse[];
  pageParams: number[];
};

type ApiResponse = {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
};


export default function Home() {
  const query = useStore((state) => state.query);
  const setCachedData = permUseStore((state) => state.setCachedData);
  const cachedData = permUseStore((state) => state.cachedData);
  const setLoaded = useStore((state) => state.setLoaded);
  const loaded = useStore((state) => state.loaded);
  const setpermquery = permUseStore((state) => state.setpermquery);
  const permquery = permUseStore((state) => state.permquery);
  const { ref, inView } = useInView();

  const queryClient = useQueryClient();

  // fetch data with react-query
  const { data, isSuccess, hasNextPage, fetchNextPage, isFetchingNextPage, status, error, refetch, isLoading } = useInfiniteQuery({
    queryKey: ["movies", query],
    enabled: false,
    queryFn: ({ pageParam = 1 }) => fetchMovies(query, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage === undefined) {
        return undefined;
      }
      const morePagesExist = lastPage.page < lastPage.total_pages;
      return morePagesExist ? lastPage.page + 1 : undefined;
    },
  });

  // save data to storage with zustand
  useEffect(() => {
    console.log(data);
    console.log(cachedData);
    if (!data && cachedData.pages.length > 0) {
      console.log("cached data");
      console.log(cachedData);
      queryClient.setQueryData(["movies", ""], cachedData);
    }
    if (data && data.pages.length > 0 && data.pages[0].results.length > 0) {
      console.log("saving data");
      setCachedData(data as unknown as CachedData);
    }
    if (query !== "") {
      setpermquery(query);
    }
  }, [data, setCachedData, query, setpermquery, cachedData, queryClient]);

  //refetch on query change to enable search
  useEffect(() => {
    if (query !== "" && isLoading === false) {
      refetch();
    }
  }, [query, isLoading, refetch]);

  // load more data on scroll
  useEffect(() => {
    if (inView) {
      console.log("fetching next page");
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-[20px] bg-slate-800 text-white">
      <h1 className="text-5xl m-0">Legalot - Tech Challenge</h1>
      <div className="flex">
        {images.map((image) => (
          <div className="relative w-[100px] h-[100px] m-5" key={image.src}>
            <Image src={image} alt="Tech Icon" fill />
          </div>
        ))}
      </div>
      <h2 className="text-4xl m-0">Movie Search</h2>
      <Searchbar error={error ? error.message : undefined} />
      <div className="flex-col flex gap-[20px]">
        {isSuccess &&
          data.pages.map((page) =>
            page.results.map((movie: Movie) => (
              <Card key={movie.id} className="w-[70vw] p-5  flex flex-col items-center bg-transparent text-white border-white">
                <h3 className=" text-5xl my-7">{movie.title}</h3>
                {movie.poster_path &&
                  <div className="relative my-10 ">
                    <img loading="lazy" src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                  </div>
                }
                <p className="text-center text-xl">{movie.overview}</p>
              </Card>
            ))
          )}
      </div>
      {loaded && query !== "" && (
        <Button ref={ref} onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
          {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load Newer" : "Nothing more to load"}
        </Button>
      )}
    </main>
  );
}

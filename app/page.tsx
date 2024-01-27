"use client";

import { useInfiniteQuery, QueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Card } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import Searchbar from "@/components/Searchbar";
import { create } from "zustand";
import { useStore } from "@/components/store";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NzUyMWVjNGNiMGZjNTIwZGIxM2RlNjczMDc5MDY1NCIsInN1YiI6IjYzNzViYjBjNjZhN2MzMDA4MjQ4ZDY5NCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.2oj-bDxUbrknbMaimQxS7G3HvjoW4Wwe6aAHHEsEZrI",
  },
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

type Response = {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
};

export default function Home() {

  const query = useStore((state) => state.query);
  const setQuery = useStore((state) => state.setQuery);
  const setData = useStore((state) => state.setData);
  const setLoaded = useStore((state) => state.setLoaded);
  const loaded = useStore((state) => state.loaded);
  const { ref, inView } = useInView();

  async function fetchMovies(pageNum: number, query: string): Promise<Response> {
    console.log("fetching movies");
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=${pageNum}`, options);
    if (query !== ""){setLoaded(true);}
    return response.json();
  }

  const { data, isSuccess, hasNextPage, fetchNextPage, isFetchingNextPage, error } = useInfiniteQuery({
    queryKey: ["movies", query],
    queryFn: ({ pageParam = 1 }) => fetchMovies(pageParam, query),
    initialPageParam: 1,
    getNextPageParam: (lastPage : Response ) => {
      console.log(lastPage);
      if (!lastPage) return undefined;
      const morePagesExist = lastPage.page < lastPage.total_pages;
      return morePagesExist ? lastPage.page + 1 : undefined;
    },
  });

  useEffect(() => {
    if (data) {
      setData(data);
    }
  }, [data, setData]);
  

  useEffect(() => {
    if (inView) {
      console.log("fetching next page");
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-[20px] ">
      <h1 className="text-5xl m-0">Legalot - Tech Challenge</h1>
      <h2 className="text-2xl m-0">Movie Search</h2>
      <Searchbar />
      <div className="flex-col flex gap-[20px]">
        {isSuccess && 
          data.pages.map((page) =>
            page.results.map((movie : Movie) => (
              <Card key={movie.id} className="w-[500px] p-5 border-black">
                <h3>{movie.title}</h3>
                <Separator className="bg-black h-1 my-2"/>
                <p>{movie.overview}</p>
              </Card>
            ))
          )}
      </div>
      {loaded && 
      <Button ref={ref} onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
        {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load Newer" : "Nothing more to load"}
      </Button>}
      <ReactQueryDevtools initialIsOpen />
    </main>
  );
}

"use client";

import { useInfiniteQuery, useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Card } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import Searchbar from "@/components/Searchbar";
import { permUseStore, useStore } from "@/components/store";
import axios from "axios";
import { unknown } from "zod";


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

//query client for react-query cached data

export default function Home() {
  const query = useStore((state) => state.query);
  const setCachedData = permUseStore((state) => state.setCachedData);
  const cachedData = permUseStore((state) => state.cachedData);
  const setLoaded = useStore((state) => state.setLoaded);
  const loaded = useStore((state) => state.loaded);
  const setpermquery = permUseStore((state) => state.setpermquery);
  const permquery = permUseStore((state) => state.permquery);
  const { ref, inView } = useInView();

  // fetch data from API
  async function fetchMovies(pageNum: number,) {
    const options = {
      method: "GET",
      url: "https://api.themoviedb.org/3/search/movie",
      params: { query: query, include_adult: "false", language: "en-US", page: pageNum.toString()},
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
      },
    };

    console.log("fetching movies");
    if (query !== "") {
      try {
        const response = await axios.request(options);
        if (response.status !== 200) {
          throw new Error('API key might be wrong or request failed');
        }
        setLoaded(true);
        return response.data;
      }
      catch (error) {
        console.error(error);
        throw error;
      } 
    }else {
        // Return a default value when query is an empty string
        return {
          page: 1,
          results: [],
          total_pages: 1,
          total_results: 0
        };
    }
  }

  // fetch data with react-query
  const { data, isSuccess, hasNextPage, fetchNextPage, isFetchingNextPage, status, error, refetch, isLoading } = useInfiniteQuery({
    queryKey: ["movies", query],
    enabled: false,
    queryFn: ({ pageParam = 1 }) => fetchMovies(pageParam),
    initialData: () => {
      if (cachedData) {
        console.log("using cached data");
        console.log(cachedData);
        return cachedData;
      } 
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const morePagesExist = lastPage.page < lastPage.total_pages;
      return morePagesExist ? lastPage.page + 1 : undefined;
    },
  });


  // save data to storage with zustand
  useEffect(() => {
    if (data) {
      setCachedData(data as unknown as CachedData);
    }
    if (query !== "") {
      setpermquery(query)
    }
  }, [data, setCachedData, query, setpermquery]);

  //refetch on query change to enable search
  useEffect(() => {
    if (query !== "" && isLoading === false) {
      refetch()
    }
  }, [query, isLoading, refetch])


  // load more data on scroll
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
      <Searchbar error={error ? error.message : undefined }/>
      <div className="flex-col flex gap-[20px]">
        {isSuccess &&
          data.pages.map((page) =>
            page.results.map((movie: Movie) => (
              <Card key={movie.id} className="w-[500px] p-5 border-black">
                <h3>{movie.title}</h3>
                <Separator className="bg-black h-1 my-2" />
                <p>{movie.overview}</p>
              </Card>
            ))
          )}
      </div>
      {loaded && query !== "" && (
        <Button ref={ref} onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
          {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load Newer" : "Nothing more to load"}
        </Button>
      )}
      <ReactQueryDevtools initialIsOpen />
    </main>
  );
}

import axios from "axios";

export async function fetchMovies(query: string, pageNum: number) {
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
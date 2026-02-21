import { Genre } from "./genre.model";
import { Movie } from "./movie.model";

export interface MovieDetail extends Movie {
  genres: Genre[];
  runtime: number | null;
  tagline: string;
}

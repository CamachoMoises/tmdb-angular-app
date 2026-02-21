import { Movie } from "./movie.model";

export type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface SearchState {
  status: SearchStatus;
  data: Movie[];
  error: string | null;
  page: number;
  totalPages: number;
}

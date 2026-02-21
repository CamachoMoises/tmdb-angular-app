import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie } from '../../shared/models/movie.model';
import { MovieDetail } from '../../shared/models/movie-detail.model';
import { Genre } from '../../shared/models/genre.model';
import { PaginatedResponse } from '../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.tmdbBaseUrl;

  searchMovies(query: string, page = 1): Observable<PaginatedResponse<Movie>> {
    return this.http.get<PaginatedResponse<Movie>>(`${this.baseUrl}/search/movie`, {
      params: { query, page: page.toString() }
    });
  }

  getMovieById(id: number): Observable<MovieDetail> {
    return this.http.get<MovieDetail>(`${this.baseUrl}/movie/${id}`);
  }

  getGenres(): Observable<{ genres: Genre[] }> {
    return this.http.get<{ genres: Genre[] }>(`${this.baseUrl}/genre/movie/list`);
  }
}

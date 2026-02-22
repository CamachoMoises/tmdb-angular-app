import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { EMPTY, Subject, catchError, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TmdbService } from '../../../../core/services/tmdb.service';
import { SearchState } from '../../../../shared/models/search-state.model';
import { SearchBar } from '../../components/search-bar/search-bar';
import { MovieList } from '../../components/movie-list/movie-list';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    SearchBar,
    MovieList
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search {
  private readonly tmdb = inject(TmdbService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly searchTrigger$ = new Subject<{ query: string; page: number }>();

  state: SearchState = {
    status: 'idle',
    data: [],
    error: null,
    page: 1,
    totalPages: 0
  };

  currentQuery = '';

  constructor() {
    this.searchTrigger$.pipe(
      tap(() => this.setState({ status: 'loading', error: null })),
      switchMap(({ query, page }) =>
        this.tmdb.searchMovies(query, page).pipe(
          catchError(err => {
            this.setState({ status: 'error', error: err.userMessage });
            return EMPTY;
          })
        )
      ),
      takeUntilDestroyed()
    ).subscribe(response => {
      this.setState({
        status: response.results.length ? 'success' : 'empty',
        data: response.results,
        page: response.page,
        totalPages: response.total_pages
      });
    });

    this.route.queryParams.pipe(
      takeUntilDestroyed()
    ).subscribe(params => {
      this.currentQuery = params['q'] ?? '';
      const page = Number(params['page']) || 1;

      if (this.currentQuery.length >= 2) {
        this.searchTrigger$.next({ query: this.currentQuery, page });
      }
    });
  }

  onSearch(query: string): void {
    if (query.length > 0 && query.length < 2) return;

    if (query.length === 0) {
      this.setState({ status: 'idle', data: [], error: null });
      this.router.navigate([], { queryParams: {} });
      return;
    }

    this.currentQuery = query;
    this.router.navigate([], { queryParams: { q: query, page: 1 } });

    this.searchTrigger$.next({ query, page: 1 });
  }

  onPageChange(page: number): void {
    this.router.navigate([], { queryParams: { q: this.currentQuery, page } });
    this.searchTrigger$.next({ query: this.currentQuery, page });
  }

  private setState(partial: Partial<SearchState>): void {
    this.state = { ...this.state, ...partial };
  }
}
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { EMPTY, switchMap, tap, catchError, of } from 'rxjs';
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

  state: SearchState = {
    status: 'idle',
    data: [],
    error: null,
    page: 1,
    totalPages: 0
  };

  currentQuery = '';

  constructor() {
    this.route.queryParams.pipe(
      takeUntilDestroyed()
    ).subscribe(params => {
      this.currentQuery = params['q'] ?? '';
    });
  }

  onSearch(query: string): void {
    if (query.length > 0 && query.length < 2) return;

    if (query.length === 0) {
      this.setState({ status: 'idle', data: [], error: null });
      this.router.navigate([], { queryParams: {} });
      return;
    }

    this.setState({ status: 'loading', error: null });
    this.router.navigate([], { queryParams: { q: query, page: 1 } });

    this.tmdb.searchMovies(query, 1).pipe(
      catchError(err => {
        this.setState({ status: 'error', error: err.userMessage });
        return EMPTY;
      })
    ).subscribe(response => {
      this.setState({
        status: response.results.length ? 'success' : 'empty',
        data: response.results,
        page: response.page,
        totalPages: response.total_pages
      });
    });
  }

  onPageChange(page: number): void {
    this.setState({ status: 'loading' });
    this.router.navigate([], { queryParams: { q: this.currentQuery, page } });

    this.tmdb.searchMovies(this.currentQuery, page).pipe(
      catchError(err => {
        this.setState({ status: 'error', error: err.userMessage });
        return EMPTY;
      })
    ).subscribe(response => {
      this.setState({
        status: response.results.length ? 'success' : 'empty',
        data: response.results,
        page: response.page,
        totalPages: response.total_pages
      });
    });
  }

  private setState(partial: Partial<SearchState>): void {
    this.state = { ...this.state, ...partial };
  }
}
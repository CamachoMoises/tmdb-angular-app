import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Movie } from '../../shared/models/movie.model';

const STORAGE_KEY = 'tmdb_favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly favoritesSubject = new BehaviorSubject<Movie[]>(
    this.loadFromStorage()
  );

  favorites$: Observable<Movie[]> = this.favoritesSubject.asObservable();

  addFavorite(movie: Movie): void {
    if (this.isFavorite(movie.id)) return;
    const updated = [...this.favoritesSubject.value, movie];
    this.updateFavorites(updated);
  }

  removeFavorite(id: number): void {
    const updated = this.favoritesSubject.value.filter(m => m.id !== id);
    this.updateFavorites(updated);
  }

  isFavorite(id: number): boolean {
    return this.favoritesSubject.value.some(m => m.id === id);
  }

  private updateFavorites(movies: Movie[]): void {
    this.favoritesSubject.next(movies);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  }

  private loadFromStorage(): Movie[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}
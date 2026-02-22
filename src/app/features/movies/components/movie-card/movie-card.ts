import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { Movie } from '../../../../shared/models/movie.model';
import { ImageUrlPipe } from '../../../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, ImageUrlPipe],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss'
})
export class MovieCard {
  @Input({ required: true }) movie!: Movie;

  private readonly router = inject(Router);

  get releaseYear(): string {
    return this.movie.release_date?.split('-')[0] ?? 'N/A';
  }

  navigateToDetail(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParams: Record<string, string> = {};

    if (urlParams.get('q')) queryParams['q'] = urlParams.get('q')!;
    if (urlParams.get('page')) queryParams['page'] = urlParams.get('page')!;

    this.router.navigate(['/movies', this.movie.id], { queryParams });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'no-poster.png';
  }
}
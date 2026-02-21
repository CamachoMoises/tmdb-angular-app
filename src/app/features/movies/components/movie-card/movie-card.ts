import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { Movie } from '../../../../shared/models/movie.model';
import { ImageUrlPipe } from '../../../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatChipsModule, ImageUrlPipe],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss'
})
export class MovieCard {
  @Input({ required: true }) movie!: Movie;
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'images/no-poster.png';
  }
  get releaseYear(): string {
    return this.movie.release_date?.split('-')[0] ?? 'N/A';
  }
}
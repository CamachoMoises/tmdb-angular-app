import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movie } from '../../../../shared/models/movie.model';
import { MovieCard } from '../movie-card/movie-card';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, MovieCard],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.scss'
})
export class MovieList {
  @Input({ required: true }) movies!: Movie[];
}
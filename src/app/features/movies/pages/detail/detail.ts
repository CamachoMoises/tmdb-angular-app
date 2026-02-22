import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { TmdbService } from '../../../../core/services/tmdb.service';
import { MovieDetail } from '../../../../shared/models/movie-detail.model';
import { ImageUrlPipe } from '../../../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    ImageUrlPipe
  ],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class Detail implements OnInit {
  private readonly tmdb = inject(TmdbService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  movie: MovieDetail | null = null;
  status: 'loading' | 'success' | 'error' = 'loading';
  error: string | null = null;

  private returnQuery: string | null = null;
  private returnPage: string | null = null;

  ngOnInit(): void {
    this.returnQuery = this.route.snapshot.queryParamMap.get('q');
    this.returnPage = this.route.snapshot.queryParamMap.get('page');

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tmdb.getMovieById(id).subscribe({
      next: movie => {
        this.movie = movie;
        this.status = 'success';
      },
      error: err => {
        this.error = err.userMessage;
        this.status = 'error';
      }
    });
  }

  goBack(): void {
    const queryParams: Record<string, string> = {};
    if (this.returnQuery) queryParams['q'] = this.returnQuery;
    if (this.returnPage) queryParams['page'] = this.returnPage;
    this.router.navigate(['/movies'], {
      queryParams: Object.keys(queryParams).length ? queryParams : {}
    });
  }

  get runtimeFormatted(): string {
    if (!this.movie?.runtime) return 'N/A';
    const h = Math.floor(this.movie.runtime / 60);
    const m = this.movie.runtime % 60;
    return `${h}h ${m}m`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'no-poster.png';
  }
}
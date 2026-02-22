import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCard } from './movie-card';
import { Movie } from '../../../../shared/models/movie.model';
import { RouterTestingModule } from '@angular/router/testing';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ImageUrlPipe } from '../../../../shared/pipes/image-url.pipe';
import { CommonModule } from '@angular/common';

describe('MovieCard', () => {
  let component: MovieCard;
  let fixture: ComponentFixture<MovieCard>;

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    release_date: '2023-01-01',
    vote_average: 7.5,
    poster_path: '/test-poster.jpg',
    overview: 'This is a test movie overview.',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MovieCard,
        RouterTestingModule,
        MatCardModule,
        MatChipsModule,
        CommonModule,
        ImageUrlPipe
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCard);
    component = fixture.componentInstance;
    component.movie = mockMovie;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display movie title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.title')?.textContent).toContain(mockMovie.title);
  });

  it('should display release year', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.year')?.textContent).toContain('2023');
  });

  it('should display vote average', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.rating')?.textContent).toContain('7.5');
  });

  it('should set no-poster.png on image error', () => {
    const imgElement: HTMLImageElement = fixture.nativeElement.querySelector('.poster');
    const event = { target: imgElement } as unknown as Event;
    component.onImageError(event);
    fixture.detectChanges();
    expect(imgElement.src).toContain('no-poster.png');
  });

});
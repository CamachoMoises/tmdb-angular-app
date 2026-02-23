import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { MovieCard } from './movie-card';
import { Movie } from '../../../../shared/models/movie.model';
import { FavoritesService } from '../../../../core/services/favorites.service';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  release_date: '2023-01-01',
  vote_average: 7.5,
  poster_path: '/test-poster.jpg',
  overview: 'This is a test movie overview.'
};

describe('MovieCard', () => {
  let component: MovieCard;
  let fixture: ComponentFixture<MovieCard>;
  let favoritesService: { isFavorite: ReturnType<typeof vi.fn>; addFavorite: ReturnType<typeof vi.fn>; removeFavorite: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    favoritesService = {
      isFavorite: vi.fn().mockReturnValue(false),
      addFavorite: vi.fn(),
      removeFavorite: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MovieCard],
      providers: [
        provideRouter([]),
        { provide: FavoritesService, useValue: favoritesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCard);
    component = fixture.componentInstance;
    component.movie = mockMovie;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar el título de la película', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(mockMovie.title);
  });

  it('debería mostrar el año de estreno', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('2023');
  });

  it('debería mostrar el rating', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('7.5');
  });

  it('debería calcular el año correctamente', () => {
    expect(component.releaseYear).toBe('2023');
  });

  it('debería retornar N/A si no hay fecha de estreno', () => {
    component.movie = { ...mockMovie, release_date: '' };
    expect(component.releaseYear).toBe('N/A');
  });

  it('debería retornar false para isFavorite si no está en favoritos', () => {
    favoritesService.isFavorite.mockReturnValue(false);
    expect(component.isFavorite).toBeFalsy();
  });

  it('debería retornar true para isFavorite si está en favoritos', () => {
    favoritesService.isFavorite.mockReturnValue(true);
    expect(component.isFavorite).toBeTruthy();
  });

  it('debería agregar a favoritos si no está en favoritos', () => {
    favoritesService.isFavorite.mockReturnValue(false);
    const event = new MouseEvent('click');
    component.toggleFavorite(event);
    expect(favoritesService.addFavorite).toHaveBeenCalledWith(mockMovie);
  });

  it('debería quitar de favoritos si ya está en favoritos', () => {
    favoritesService.isFavorite.mockReturnValue(true);
    const event = new MouseEvent('click');
    component.toggleFavorite(event);
    expect(favoritesService.removeFavorite).toHaveBeenCalledWith(mockMovie.id);
  });

  it('debería usar imagen de fallback si el poster falla', () => {
    const img = document.createElement('img');
    const event = { target: img } as unknown as Event;
    component.onImageError(event);
    expect(img.src).toContain('no-poster.png');
  });
});

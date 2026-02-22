import { TestBed } from '@angular/core/testing';
import { Search } from './search';
import { TmdbService } from '../../../../core/services/tmdb.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError, NEVER } from 'rxjs';
import { Movie } from '../../../../shared/models/movie.model';
import { PaginatedResponse } from '../../../../shared/models/api-response.model';
import { provideAnimations } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

const mockMovie: Movie = {
  id: 1,
  title: 'Batman',
  release_date: '2022-03-04',
  vote_average: 7.5,
  poster_path: '/abc123.jpg',
  overview: 'A superhero movie.'
};

const mockResponse: PaginatedResponse<Movie> = {
  page: 1,
  results: [mockMovie],
  total_pages: 3,
  total_results: 30
};

const emptyResponse: PaginatedResponse<Movie> = {
  page: 1,
  results: [],
  total_pages: 0,
  total_results: 0
};

describe('Search', () => {
  let component: Search;
  let tmdbService: { searchMovies: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    tmdbService = { searchMovies: vi.fn() };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Search],
      providers: [
        provideAnimations(),
        { provide: TmdbService, useValue: tmdbService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({ q: '' }) }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(Search);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería iniciar en estado idle', () => {
    expect(component.state.status).toBe('idle');
  });

  describe('onSearch', () => {
    it('debería pasar a estado idle con query vacía', () => {
      component.onSearch('');
      expect(component.state.status).toBe('idle');
      expect(component.state.data).toEqual([]);
    });

    it('no debería buscar con menos de 2 caracteres', () => {
      component.onSearch('b');
      expect(tmdbService.searchMovies).not.toHaveBeenCalled();
      expect(component.state.status).toBe('idle');
    });

    it('debería pasar a estado loading al buscar', () => {
      tmdbService.searchMovies.mockReturnValue(NEVER);
      component.onSearch('batman');
      expect(component.state.status).toBe('loading');
    });

    it('debería pasar a estado success con resultados', () => {
      tmdbService.searchMovies.mockReturnValue(of(mockResponse));
      component.onSearch('batman');
      expect(component.state.status).toBe('success');
      expect(component.state.data.length).toBe(1);
      expect(component.state.data[0].title).toBe('Batman');
    });

    it('debería pasar a estado empty sin resultados', () => {
      tmdbService.searchMovies.mockReturnValue(of(emptyResponse));
      component.onSearch('xyzxyzxyz');
      expect(component.state.status).toBe('empty');
      expect(component.state.data).toEqual([]);
    });

    it('debería pasar a estado error si la request falla', () => {
      tmdbService.searchMovies.mockReturnValue(
        throwError(() => ({ userMessage: 'Error de red' }))
      );
      component.onSearch('batman');
      expect(component.state.status).toBe('error');
      expect(component.state.error).toBe('Error de red');
    });

    it('debería actualizar totalPages correctamente', () => {
      tmdbService.searchMovies.mockReturnValue(of(mockResponse));
      component.onSearch('batman');
      expect(component.state.totalPages).toBe(3);
      expect(component.state.page).toBe(1);
    });

    it('debería navegar con query params al buscar', () => {
      tmdbService.searchMovies.mockReturnValue(of(mockResponse));
      component.onSearch('batman');
      expect(router.navigate).toHaveBeenCalledWith(
        [], { queryParams: { q: 'batman', page: 1 } }
      );
    });
  });

  describe('onPageChange', () => {
    it('debería cargar la página indicada', () => {
      tmdbService.searchMovies.mockReturnValue(of(mockResponse));
      component.currentQuery = 'batman';
      component.onPageChange(2);
      expect(tmdbService.searchMovies).toHaveBeenCalledWith('batman', 2);
    });

    it('debería pasar a estado loading al cambiar página', () => {
      tmdbService.searchMovies.mockReturnValue(NEVER);
      component.currentQuery = 'batman';
      component.onPageChange(2);
      expect(component.state.status).toBe('loading');
    });

    it('debería navegar con la página correcta en query params', () => {
      tmdbService.searchMovies.mockReturnValue(of(mockResponse));
      component.currentQuery = 'batman';
      component.onPageChange(2);
      expect(router.navigate).toHaveBeenCalledWith(
        [], { queryParams: { q: 'batman', page: 2 } }
      );
    });
  });
});
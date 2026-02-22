import { TestBed } from '@angular/core/testing';
import { Detail } from './detail';
import { TmdbService } from '../../../../core/services/tmdb.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MovieDetail } from '../../../../shared/models/movie-detail.model';
import { provideAnimations } from '@angular/platform-browser/animations';
import { vi } from 'vitest';


const mockMovieDetail: MovieDetail = {
  id: 1,
  title: 'Batman',
  release_date: '2022-03-04',
  vote_average: 7.5,
  poster_path: '/abc123.jpg',
  overview: 'A superhero movie.',
  genres: [
    { id: 28, name: 'Action' },
    { id: 18, name: 'Drama' }
  ],
  runtime: 120,
  tagline: 'The Dark Knight rises.'
};

const mockActivatedRoute = {
  snapshot: {
    paramMap: { get: () => '1' },
    queryParamMap: {
      get: (key: string) => {
        const params: Record<string, string> = { q: 'batman', page: '2' };
        return params[key] ?? null;
      }
    }
  }
};

describe('Detail', () => {
  let component: Detail;
  let tmdbService: { getMovieById: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    tmdbService = { getMovieById: vi.fn() };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Detail],
      providers: [
        provideAnimations(),
        { provide: TmdbService, useValue: tmdbService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();
  });

  describe('carga exitosa', () => {
    beforeEach(() => {
      tmdbService.getMovieById.mockReturnValue(of(mockMovieDetail));
      const fixture = TestBed.createComponent(Detail);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería cargar el detalle de la película', () => {
      expect(component.status).toBe('success');
      expect(component.movie).toEqual(mockMovieDetail);
    });

    it('debería llamar a getMovieById con el ID correcto', () => {
      expect(tmdbService.getMovieById).toHaveBeenCalledWith(1);
    });

    it('debería formatear el runtime correctamente', () => {
      expect(component.runtimeFormatted).toBe('2h 0m');
    });

    it('debería retornar N/A si runtime es null', () => {
      component.movie = { ...mockMovieDetail, runtime: null };
      expect(component.runtimeFormatted).toBe('N/A');
    });
  });

  describe('carga con error', () => {
    beforeEach(() => {
      tmdbService.getMovieById.mockReturnValue(
        throwError(() => ({ userMessage: 'Recurso no encontrado.' }))
      );
      const fixture = TestBed.createComponent(Detail);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('debería pasar a estado error si la request falla', () => {
      expect(component.status).toBe('error');
      expect(component.error).toBe('Recurso no encontrado.');
    });

    it('debería tener movie como null en caso de error', () => {
      expect(component.movie).toBeNull();
    });
  });

  describe('navegación', () => {
    beforeEach(() => {
      tmdbService.getMovieById.mockReturnValue(of(mockMovieDetail));
      const fixture = TestBed.createComponent(Detail);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('debería navegar a /movies con query params al hacer goBack', () => {
      component.goBack();
      expect(router.navigate).toHaveBeenCalledWith(
        ['/movies'],
        { queryParams: { q: 'batman', page: '2' } }
      );
    });

    it('debería navegar a /movies sin query params si no hay q', () => {
      component['returnQuery'] = null;
      component['returnPage'] = null;
      component.goBack();
      expect(router.navigate).toHaveBeenCalledWith(
        ['/movies'],
        { queryParams: {} }
      );
    });
  });

  describe('onImageError', () => {
    beforeEach(() => {
      tmdbService.getMovieById.mockReturnValue(of(mockMovieDetail));
      const fixture = TestBed.createComponent(Detail);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('debería usar imagen de fallback si el poster falla', () => {
      const img = document.createElement('img');
      const event = { target: img } as unknown as Event;
      component.onImageError(event);
      expect(img.src).toContain('no-poster.png');
    });
  });
});
import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';
import { Movie } from '../../shared/models/movie.model';

const mockMovie: Movie = {
  id: 1,
  title: 'Batman',
  release_date: '2022-03-04',
  vote_average: 7.5,
  poster_path: '/abc123.jpg',
  overview: 'A superhero movie.'
};

const mockMovie2: Movie = {
  id: 2,
  title: 'Superman',
  release_date: '2023-01-01',
  vote_average: 6.5,
  poster_path: '/xyz456.jpg',
  overview: 'Another superhero movie.'
};

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoritesService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('addFavorite', () => {
    it('debería agregar una película a favoritos', () => {
      service.addFavorite(mockMovie);
      expect(service.isFavorite(mockMovie.id)).toBeTruthy();
    });

    it('no debería duplicar una película ya en favoritos', () => {
      service.addFavorite(mockMovie);
      service.addFavorite(mockMovie);

      service.favorites$.subscribe(favs => {
        expect(favs.length).toBe(1);
      });
    });

    it('debería poder agregar múltiples películas', () => {
      service.addFavorite(mockMovie);
      service.addFavorite(mockMovie2);

      service.favorites$.subscribe(favs => {
        expect(favs.length).toBe(2);
      });
    });

    it('debería persistir en localStorage al agregar', () => {
      service.addFavorite(mockMovie);
      const stored = JSON.parse(localStorage.getItem('tmdb_favorites')!);
      expect(stored.length).toBe(1);
      expect(stored[0].id).toBe(1);
    });
  });

  describe('removeFavorite', () => {
    it('debería eliminar una película de favoritos', () => {
      service.addFavorite(mockMovie);
      service.removeFavorite(mockMovie.id);
      expect(service.isFavorite(mockMovie.id)).toBeFalsy();
    });

    it('no debería fallar al eliminar una película que no existe', () => {
      expect(() => service.removeFavorite(999)).not.toThrow();
    });

    it('debería actualizar localStorage al eliminar', () => {
      service.addFavorite(mockMovie);
      service.removeFavorite(mockMovie.id);
      const stored = JSON.parse(localStorage.getItem('tmdb_favorites')!);
      expect(stored.length).toBe(0);
    });

    it('debería mantener otras películas al eliminar una', () => {
      service.addFavorite(mockMovie);
      service.addFavorite(mockMovie2);
      service.removeFavorite(mockMovie.id);

      service.favorites$.subscribe(favs => {
        expect(favs.length).toBe(1);
        expect(favs[0].id).toBe(mockMovie2.id);
      });
    });
  });

  describe('isFavorite', () => {
    it('debería retornar true si la película está en favoritos', () => {
      service.addFavorite(mockMovie);
      expect(service.isFavorite(mockMovie.id)).toBeTruthy();
    });

    it('debería retornar false si la película no está en favoritos', () => {
      expect(service.isFavorite(999)).toBeFalsy();
    });
  });

  describe('favorites$', () => {
    it('debería emitir la lista actualizada al agregar', () => {
      return new Promise<void>(resolve => {
        let emitCount = 0;

        service.favorites$.subscribe(favs => {
          emitCount++;
          if (emitCount === 2) {
            expect(favs.length).toBe(1);
            expect(favs[0].id).toBe(mockMovie.id);
            resolve();
          }
        });

        service.addFavorite(mockMovie);
      });
    });

    it('debería emitir la lista actualizada al eliminar', () => {
      return new Promise<void>(resolve => {
        service.addFavorite(mockMovie);
        let emitCount = 0;

        service.favorites$.subscribe(favs => {
          emitCount++;
          if (emitCount === 2) {
            expect(favs.length).toBe(0);
            resolve();
          }
        });

        service.removeFavorite(mockMovie.id);
      });
    });
  });

  describe('persistencia', () => {
    it('debería cargar favoritos desde localStorage al iniciar', () => {
      localStorage.setItem('tmdb_favorites', JSON.stringify([mockMovie]));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(FavoritesService);

      expect(newService.isFavorite(mockMovie.id)).toBeTruthy();
    });

    it('debería retornar lista vacía si localStorage está corrupto', () => {
      localStorage.setItem('tmdb_favorites', 'invalid_json{{');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(FavoritesService);

      newService.favorites$.subscribe(favs => {
        expect(favs.length).toBe(0);
      });
    });
  });
});
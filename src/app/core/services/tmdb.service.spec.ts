import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TmdbService } from './tmdb.service';
import { Movie } from '../../shared/models/movie.model';
import { MovieDetail } from '../../shared/models/movie-detail.model';
import { PaginatedResponse } from '../../shared/models/api-response.model';

describe('TmdbService', () => {
  let service: TmdbService;
  let httpMock: HttpTestingController;

  const mockMovie: Movie = {
    id: 1,
    title: 'Batman',
    release_date: '2022-03-04',
    vote_average: 7.5,
    poster_path: '/abc123.jpg',
    overview: 'A superhero movie.'
  };

  const mockPaginatedResponse: PaginatedResponse<Movie> = {
    page: 1,
    results: [mockMovie],
    total_pages: 5,
    total_results: 100
  };

  const mockDetail: MovieDetail = {
    ...mockMovie,
    genres: [{ id: 28, name: 'Action' }],
    runtime: 120,
    tagline: 'The Dark Knight rises.'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TmdbService]
    });
    service = TestBed.inject(TmdbService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('searchMovies', () => {
    it('debería retornar películas al buscar', () => {
      service.searchMovies('batman', 1).subscribe(response => {
        expect(response.results.length).toBe(1);
        expect(response.results[0].title).toBe('Batman');
        expect(response.total_pages).toBe(5);
      });

      const req = httpMock.expectOne(r => r.url.includes('/search/movie'));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('query')).toBe('batman');
      expect(req.request.params.get('page')).toBe('1');
      req.flush(mockPaginatedResponse);
    });

    it('debería usar página 1 por defecto', () => {
      service.searchMovies('batman').subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/search/movie'));
      expect(req.request.params.get('page')).toBe('1');
      req.flush(mockPaginatedResponse);
    });

    it('debería propagar error 404', () => {
      service.searchMovies('batman').subscribe({
        error: err => expect(err.status).toBe(404)
      });

      const req = httpMock.expectOne(r => r.url.includes('/search/movie'));
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getMovieById', () => {
    it('debería retornar el detalle de una película', () => {
      service.getMovieById(1).subscribe(detail => {
        expect(detail.id).toBe(1);
        expect(detail.genres.length).toBe(1);
        expect(detail.runtime).toBe(120);
      });

      const req = httpMock.expectOne(r => r.url.includes('/movie/1'));
      expect(req.request.method).toBe('GET');
      req.flush(mockDetail);
    });

    it('debería propagar error 404 para película inexistente', () => {
      service.getMovieById(99999).subscribe({
        error: err => expect(err.status).toBe(404)
      });

      const req = httpMock.expectOne(r => r.url.includes('/movie/99999'));
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getGenres', () => {
    it('debería retornar la lista de géneros', () => {
      const mockGenres = { genres: [{ id: 28, name: 'Action' }] };

      service.getGenres().subscribe(response => {
        expect(response.genres.length).toBe(1);
        expect(response.genres[0].name).toBe('Action');
      });

      const req = httpMock.expectOne(r => r.url.includes('/genre/movie/list'));
      req.flush(mockGenres);
    });
  });
});
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { errorInterceptor } from './error.interceptor';

describe('ErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debería agregar userMessage en error 401', () => {
    http.get(`${environment.tmdbBaseUrl}/search/movie`).subscribe({
      error: err => expect(err.userMessage).toBe('API Key inválida o sin permisos.')
    });

    const req = httpMock.expectOne(r => r.url.includes('/search/movie'));
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('debería agregar userMessage en error 404', () => {
    http.get(`${environment.tmdbBaseUrl}/movie/1`).subscribe({
      error: err => expect(err.userMessage).toBe('Recurso no encontrado.')
    });

    const req = httpMock.expectOne(r => r.url.includes('/movie/1'));
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('debería agregar userMessage en error de red', () => {
    http.get(`${environment.tmdbBaseUrl}/search/movie`).subscribe({
      error: err => expect(err.userMessage).toContain('conexión')
    });

    const req = httpMock.expectOne(r => r.url.includes('/search/movie'));
    req.error(new ProgressEvent('network error'));
  });

  it('debería agregar userMessage genérico en error 500', () => {
    http.get(`${environment.tmdbBaseUrl}/search/movie`).subscribe({
      error: err => expect(err.userMessage).toBe('Error inesperado. Intenta de nuevo.')
    });

    const req = httpMock.expectOne(r => r.url.includes('/search/movie'));
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });
});
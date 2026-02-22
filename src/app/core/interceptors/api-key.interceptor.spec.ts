import { apiKeyInterceptor } from './api-key.interceptor';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';

describe('apiKeyInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiKeyInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debería agregar api_key a requests de TMDb', () => {
    http.get(`${environment.tmdbBaseUrl}/search/movie`).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/search/movie'));
    expect(req.request.params.has('api_key')).toBe(true);
    expect(req.request.params.get('api_key')).toBe(environment.tmdbApiKey);
    req.flush({});
  });

  it('no debería agregar api_key a requests de otros dominios', () => {
    http.get('https://otro-dominio.com/data').subscribe();

    const req = httpMock.expectOne('https://otro-dominio.com/data');
    expect(req.request.params.has('api_key')).toBe(false);
    req.flush({});
  });
});
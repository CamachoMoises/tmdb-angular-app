import { ImageUrlPipe } from './image-url.pipe';

describe('ImageUrlPipe', () => {
  let pipe: ImageUrlPipe;

  beforeEach(() => {
    pipe = new ImageUrlPipe();
  });

  it('debería crearse correctamente', () => {
    expect(pipe).toBeTruthy();
  });

  it('debería construir la URL completa con tamaño especificado', () => {
    const result = pipe.transform('/abc123.jpg', 'w500');
    expect(result).toContain('w500');
    expect(result).toContain('/abc123.jpg');
  });

  it('debería usar tamaño w200 por defecto', () => {
    const result = pipe.transform('/abc123.jpg');
    expect(result).toContain('w200');
  });

  it('debería retornar imagen de fallback si poster_path es null', () => {
    const result = pipe.transform(null);
    expect(result).toBe('images/no-poster.png');
  });

  it('debería retornar imagen de fallback si poster_path es string vacío', () => {
    const result = pipe.transform('');
    expect(result).toBe('images/no-poster.png');
  });
});
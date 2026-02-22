# TMDb Explorer 🎬

Aplicación Angular que consume la API de The Movie Database (TMDb) para buscar y explorar películas. Implementa arquitectura modular con lazy loading, gestión de estados asíncronos con RxJS, interceptors HTTP y sistema de favoritos persistente.

---

## Requisitos previos

- Node.js 18+
- Angular CLI 21+
- API Key de [TMDb](https://www.themoviedb.org/settings/api)

---

## Instalación

1. Clona el repositorio:
```bash
   git clone https://github.com/tu-usuario/tmdb-app.git
   cd tmdb-app
```

2. Instala las dependencias:
```bash
   npm install
```

3. Crea el archivo de variables de entorno:
```bash
   cp .env.example .env
```

4. Edita `.env` y agrega tu API Key de TMDb:
```
   NG_APP_TMDB_API_KEY=tu_api_key_aqui
   NG_APP_TMDB_BASE_URL=https://api.themoviedb.org/3
   NG_APP_TMDB_IMAGE_URL=https://image.tmdb.org/t/p
```

---

## Ejecución
```bash
# Desarrollo
npm start

# Build de producción
npm run build

# Tests
npm test

# Tests con cobertura
npm run test:coverage

# Lint
npm run lint
```

---

## Funcionalidades implementadas

### Búsqueda de películas
- Campo de búsqueda con validación mínima de 2 caracteres
- Debounce de 400ms para evitar llamadas innecesarias
- Cancelación de requests anteriores con `switchMap`
- 5 estados explícitos: `idle`, `loading`, `success`, `empty`, `error`
- Paginación sincronizada con query params en la URL

### Listado de resultados
- Grid responsivo de movie cards
- Poster, título, año y rating por película
- Imagen de fallback cuando no hay poster disponible
- Navegación al detalle manteniendo los query params

### Vista de detalle
- Título, tagline, sinopsis, géneros, rating, fecha de estreno y duración
- Botón de volver que restaura la búsqueda anterior con su página

### Sistema de favoritos
- Agregar y quitar favoritos desde la card y el detalle
- Persistencia en `localStorage`
- Reactivo con `BehaviorSubject`

### Arquitectura
- API Key gestionada con `@ngx-env/builder` y archivo `.env`
- `ApiKeyInterceptor` inyecta la key automáticamente en cada request
- `ErrorInterceptor` centraliza el manejo de errores HTTP
- Lazy loading en todos los feature modules
- TypeScript en modo strict sin ningún `any`

---

## Decisiones técnicas

### `switchMap` para cancelación de requests
Al escribir en el buscador, cada keystroke podría generar una request. Con `switchMap`, si llega una nueva búsqueda antes de que la anterior resuelva, la anterior se cancela automáticamente. Usar `mergeMap` o `concatMap` dejaría requests huérfanas que podrían sobreescribir resultados más recientes.

### SearchStatus como tipo enumerado
En lugar de booleans sueltos (`isLoading`, `hasError`, `isEmpty`), se define un tipo `'idle' | 'loading' | 'success' | 'empty' | 'error'`. Esto hace el estado imposible de combinar de forma inválida (no puede estar `loading` y `error` al mismo tiempo) y simplifica el template con `@switch`.

### ApiKeyInterceptor en lugar de params manuales
Si cada servicio o componente gestionara la API key manualmente, cualquier cambio requeriría modificar múltiples archivos. El interceptor centraliza esta responsabilidad y además facilita el testing al poder mockearlo de forma independiente.

### `@ngx-env/builder` para variables de entorno
La API key no puede estar hardcodeada en el repositorio. Con `@ngx-env/builder` se lee desde un archivo `.env` en tiempo de build, manteniendo el `environment.ts` limpio y el repositorio seguro.

### Angular Material para la UI
El enunciado indica que el diseño no es prioritario. Angular Material provee componentes listos (spinner, chips, cards) que permiten invertir el tiempo en lo que sí se evalúa: arquitectura, RxJS y testing.

---

## Qué mejoraría con más tiempo

- **Signals**: migrar el estado del `SearchComponent` a `signal()` y `computed()` para aprovechar la reactividad granular de Angular 17+
- **Cache de requests**: usar `shareReplay(1)` en el `TmdbService` para no repetir llamadas idénticas
- **Infinite scroll**: reemplazar la paginación clásica por scroll infinito con `IntersectionObserver`
- **Página de favoritos**: una ruta `/favorites` dedicada con su propio listado
- **Filtro por género**: llamada a `/genre/movie/list` con persistencia en query params
- **E2E tests**: cobertura con Playwright para los flujos principales
- **Skeleton loaders**: reemplazar el spinner por placeholders del tamaño real del contenido
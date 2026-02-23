# Explorador de peliculas Tmdb

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
   git clone https://github.com/CamachoMoises/tmdb-angular-app
   cd tmdb-angular-app
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
- Paginación sincronizada con query params en la URL (`?q=batman&page=2`)

### Listado de resultados
- Grid responsivo de 2 a 6 columnas según el viewport
- Poster, título, año y rating por película
- Overlay con efecto hover estilo Netflix
- Imagen de fallback cuando no hay poster disponible
- Navegación al detalle manteniendo los query params actuales
- Indicador visual de favoritos siempre visible en las cards marcadas

### Vista de detalle
- Fondo con el poster de la película difuminado y degradado a negro
- Título, tagline, sinopsis, géneros, rating, fecha de estreno y duración
- Botón de favoritos integrado
- Botón de volver que restaura la búsqueda anterior con su página

### Sistema de favoritos
- Agregar y quitar favoritos desde la card y la vista de detalle
- Persistencia en `localStorage`
- Reactivo con `BehaviorSubject` — la UI se actualiza en tiempo real
- Las cards favoritas muestran el ícono de corazón sin necesidad de hover

### Arquitectura
- API Key gestionada con `@ngx-env/builder` y archivo `.env` — nunca en el código fuente
- `ApiKeyInterceptor` inyecta la key automáticamente en cada request hacia TMDb
- `ErrorInterceptor` centraliza el manejo de errores HTTP con mensajes amigables
- Lazy loading en todos los feature modules
- TypeScript en modo strict sin ningún `any`
- ESLint configurado

### UI/UX
- Dark mode estilo Netflix/IMDb
- Iconos con Lucide Angular
- Diseño responsivo con Tailwind CSS v3
- Spinner de carga animado
- Transiciones y efectos hover suaves

---

## Decisiones técnicas

### `switchMap` para cancelación de requests
Al escribir en el buscador, cada keystroke podría generar una nueva request HTTP. Con `switchMap`, si llega una nueva búsqueda antes de que la anterior resuelva, la anterior se cancela automáticamente. Esto evita condiciones de carrera donde una búsqueda más lenta podría sobreescribir los resultados de una más reciente.

Usar `mergeMap` o `concatMap` no cancelaría requests anteriores y dejaría observables huérfanos activos. Usar un simple `subscribe` dentro de `subscribe` es un antipatrón que rompe la cadena de operadores RxJS.

### Subject + switchMap como pipeline central
Todas las búsquedas (desde el input, desde la paginación, desde la URL) pasan por un único `Subject` que alimenta el pipeline de `switchMap`. Esto garantiza que sin importar el origen de la búsqueda, la cancelación de requests anteriores siempre funciona correctamente.

### SearchStatus como tipo enumerado
En lugar de booleans sueltos (`isLoading`, `hasError`, `isEmpty`), se define un tipo `'idle' | 'loading' | 'success' | 'empty' | 'error'`. Esto hace el estado imposible de combinar de forma inválida — no puede estar `loading` y `error` al mismo tiempo. Simplifica el template con `@switch` y hace los tests más expresivos.

### ApiKeyInterceptor en lugar de params manuales
Si cada servicio gestionara la API key manualmente, cualquier cambio requeriría modificar múltiples archivos. El interceptor centraliza esta responsabilidad en un único lugar y es transparente para el resto del código. También facilita el testing al poder mockearlo de forma independiente.

### @ngx-env/builder para variables de entorno
La API key no puede estar hardcodeada en el repositorio. Con `@ngx-env/builder` se lee desde un archivo `.env` en tiempo de build usando variables con prefijo `NG_APP_`. El repositorio solo contiene el `.env.example` con valores de ejemplo, nunca la key real.

### Restauración de query params al volver del detalle
Al navegar a la vista de detalle, los query params actuales (`q` y `page`) se pasan como parámetros de la URL. Al volver, el `DetailComponent` los lee y los restaura en la navegación, evitando que el usuario pierda su búsqueda y página actual.

### Angular Material + Tailwind CSS
Se combinan ambas librerías con responsabilidades distintas — Angular Material para componentes con lógica (chips, spinners, form fields) y Tailwind para el layout y estilos visuales. Esto evita reinventar componentes accesibles mientras se mantiene total libertad de diseño.

### Tailwind CSS v3 en lugar de v4
Se usa Tailwind v3 porque v4 cambió completamente su integración con PostCSS y aún no tiene soporte estable con Angular 21. v3 funciona con el pipeline estándar de `postcss.config.js`.

---

## Uso de agentes de IA
En este proyecto se utilizaron agentes de inteligencia artificial para acelerar el desarrollo.
- Claude Code
  - Debugging de errores específicos
  - Diseño la estructura de carpetas.
  - Diseño del dark mode estilo Netflix/IMDb
  - Creación de patrón Subject + switchMap como pipeline central de búsquedas.
- Visual Studio Chat (GPT 4.1, Raptor Mini)
  - Corrección de errores de configuración de librerías.
  - Configuración del Tailwind
  - Creación de los modelos de datos
  - Diagnóstico del error NG0908 de Zone.js
- OpenCode (terminal agent)
  - Migración de Karma a Vitest como librería de pruebas.
  - Corrección de errores de ESLint.
  - Resolvió el conflicto de SSR/prerendering.
- Gemini
  - Reaccion del README.md con los datos del proyecto
  - uso del localStorage para almacenar los favoritos
  - creacion de la imagen para el poster no disponible

## Extras implementados

| Extra | Estado |
|-------|--------|
| Paginación con URL state (query params) | ✅ Implementado |
| Sistema de favoritos con localStorage | ✅ Implementado |
| HttpInterceptor para manejo centralizado de errores | ✅ Implementado |
| Lazy loading de módulos | ✅ Implementado |
| Tests unitarios | ✅ Implementado |
| ESLint configurado | ✅ Implementado |
| Filtro por género | ⚠️ No implementado (ver nota) |

> **Nota sobre el filtro por género:** El endpoint `/search/movie` de TMDb no soporta el parámetro `genres`. Este parámetro solo existe en `/discover/movie`, que no admite búsqueda por texto. Combinar ambos endpoints requeriría filtrar los resultados localmente por género, lo que rompe la paginación real de la API ya que los totales de páginas no coincidirían con los resultados filtrados. Se documentó como limitación de la API en lugar de implementar un workaround que comprometería la integridad de los datos.

---

## Qué mejoraría con más tiempo

- **Signals**: migrar el estado del `SearchComponent` a `signal()` y `computed()` para aprovechar la reactividad granular de Angular 17+ sin necesidad de `Subject` ni `BehaviorSubject`
- **Cache de requests**: usar `shareReplay(1)` en el `TmdbService` para no repetir llamadas idénticas cuando el usuario navega hacia atrás
- **Infinite scroll**: reemplazar la paginación clásica por scroll infinito con `IntersectionObserver`
- **Página de favoritos**: una ruta `/favorites` dedicada con su propio listado y gestión
- **Filtro por género**: implementar una vista separada de exploración usando `/discover/movie` donde el filtro por género sí funciona correctamente, manteniendo la integridad de la paginación
- **Skeleton loaders**: reemplazar el spinner por placeholders del tamaño real del contenido para una mejor experiencia de carga


## Plan de desarrollo detallado

A continuación se describe el plan original seguido para la implementación del proyecto, incluyendo la arquitectura, el stack tecnológico, el cronograma de fases y los criterios de evaluación considerados.

---

### Stack tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Angular | 21.1.x | Framework principal |
| TypeScript | Strict mode | Tipado fuerte en todo el proyecto |
| RxJS | Incluido en Angular | Gestión de asincronía y estados |
| Angular Material | Última compatible | Componentes UI (spinner, chips, cards) |
| Tailwind CSS | v3 | Estilos y diseño responsivo |
| Lucide Angular | Última | Iconografía |
| @ngx-env/builder | 21.0.1 | Variables de entorno desde .env |
| ESLint | 19.x | Linting y calidad de código |
| Vitest | Última | Testing unitario |

---

### Arquitectura del proyecto

Se utiliza una arquitectura modular por features con standalone components (Angular 17+), separando claramente la capa de datos (core), las funcionalidades de negocio (features) y los elementos reutilizables (shared).
```text
src/app/
├── core/
│   ├── interceptors/
│   │   ├── api-key.interceptor.ts      # Inyecta API key automáticamente
│   │   └── error.interceptor.ts        # Manejo global de errores HTTP
│   └── services/
│       ├── tmdb.service.ts             # Todas las llamadas a la API
│       └── favorites.service.ts        # Lógica de favoritos + localStorage
│
├── features/
│   ├── movies/                         # Lazy loaded
│   │   ├── pages/
│   │   │   ├── search/                 # Búsqueda + listado
│   │   │   └── detail/                 # Detalle de película
│   │   ├── components/
│   │   │   ├── movie-card/
│   │   │   ├── movie-list/
│   │   │   └── search-bar/
│   │   └── movies.routes.ts
│   └── favorites/                      # Lazy loaded
│       ├── pages/
│       └── favorites.routes.ts
│
├── shared/
│   ├── components/
│   │   ├── loading-spinner/
│   │   ├── error-message/
│   │   └── pagination/
│   ├── models/                         # Interfaces TypeScript
│   │   ├── movie.model.ts
│   │   ├── movie-detail.model.ts
│   │   ├── genre.model.ts
│   │   ├── api-response.model.ts
│   │   └── search-state.model.ts
│   └── pipes/
│       └── image-url.pipe.ts
│
└── environments/
    ├── environment.ts                  # API key aquí, nunca en componentes
    └── environment.prod.ts
```

---

### Cronograma de desarrollo

| Fase | Tarea | Tiempo estimado |
|------|-------|-----------------|
| Fase 1 | Setup y arquitectura base | 1–2h |
| Fase 2 | Modelos y TmdbService | 1–2h |
| Fase 2.5 | Tests: servicio e interceptors | 1–2h |
| Fase 3 | Feature: Búsqueda y listado (RxJS) | 3–4h |
| Fase 3.5 | Tests: SearchComponent y estados | 1–2h |
| Fase 4 | Feature: Vista de detalle | 1–2h |
| Fase 5 | Extras: favoritos, géneros, lazy loading | 2–4h |
| Fase 5.5 | Tests: FavoritesService e ImageUrlPipe | 1h |
| Fase 6 | Pulido final y README | 1–2h |
| **TOTAL** | | **12–21h** |

---

### Detalle de las fases

#### Fase 1 – Setup y arquitectura base
Inicialización del proyecto con Angular CLI, Angular Material, Tailwind CSS v3 y ESLint. Configuración de `@ngx-env/builder` para gestión segura de la API key mediante archivo `.env`. Creación de `ApiKeyInterceptor` y `ErrorInterceptor` para manejo global de autenticación y errores.

#### Fase 2 – Modelos y TmdbService
Definición de interfaces TypeScript (strict, sin `any`) para `Movie`, `MovieDetail`, `Genre`, respuestas paginadas y estados de búsqueda. Implementación de `TmdbService` con métodos para búsqueda, detalle y lista de géneros. Uso de tipos genéricos (`PaginatedResponse<T>`).

#### Fase 2.5 – Tests de la capa de datos e interceptors
Tests unitarios con `HttpClientTestingModule` para `TmdbService`. Verificación de que `ApiKeyInterceptor` añade la API key solo a requests de TMDb. Validación de mensajes de error en `ErrorInterceptor` según el código HTTP.

#### Fase 3 – Feature: Búsqueda y listado
Implementación del pipeline RxJS en `SearchComponent` con `debounceTime(400)`, `distinctUntilChanged`, `switchMap`, `catchError` y `takeUntilDestroyed`. Gestión de 5 estados (`idle`, `loading`, `success`, `empty`, `error`) mediante un tipo enumerado. Sincronización de la paginación con query params (`?q=batman&page=2`). Componente `MovieCard` con imagen de fallback, extracción de año y visualización de rating.

#### Fase 3.5 – Tests del SearchComponent
Cobertura de casos: estado inicial, loading, éxito con resultados, vacío, error y cancelación de requests anteriores (validación de `switchMap`).

#### Fase 4 – Feature: Vista de detalle
Ruta `/movie/:id` que lee el parámetro y obtiene los detalles desde `TmdbService`. Visualización de título, tagline, sinopsis, géneros, rating, fecha y duración. Fondo con el poster de la película difuminado y degradado a negro. Botón de volver que restaura la búsqueda anterior mediante query params.

#### Fase 5 – Extras
`FavoritesService` con `BehaviorSubject` y persistencia en `localStorage`. Integración del corazón de favoritos en `MovieCard` y en la vista de detalle, con reactividad en tiempo real. Las cards favoritas muestran el ícono siempre visible sin necesidad de hover. Lazy loading configurado en las rutas de movies y favorites.

#### Fase 5.5 – Tests adicionales
Tests para `FavoritesService` (persistencia, no duplicados, reactividad) y para `ImageUrlPipe` (construcción de URL, fallback). Tests para `MovieCard` (favoritos, año, fallback de imagen).

#### Fase 6 – Pulido final y README
Verificación de que no exista ningún `any` en el código. Comprobación de que la API key solo aparece en `.env`. Ejecución de lint sin warnings y paso de todos los tests. Redacción del README con decisiones técnicas y justificaciones.

---

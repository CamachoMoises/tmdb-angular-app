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
- **E2E tests**: cobertura con Playwright para los flujos principales — búsqueda, navegación al detalle y favoritos
- **Prettier**: configurar junto con ESLint para formateo automático consistente
- **Página 404**: vista personalizada para rutas no encontradas

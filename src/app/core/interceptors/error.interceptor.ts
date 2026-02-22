import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { catchError, throwError } from "rxjs";

const getUserMessage = (error: HttpErrorResponse): string => {
  if (error.status === 0) return 'Error de conexión. Revisa tu red.';
  if (error.status === 401) return 'API Key inválida o sin permisos.';
  if (error.status === 404) return 'Recurso no encontrado.';
  return 'Error inesperado. Intenta de nuevo.';
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const userMessage = getUserMessage(error);
      return throwError(() => ({ ...error, userMessage }));
    })
  );
};

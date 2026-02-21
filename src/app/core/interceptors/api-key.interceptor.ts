import { HttpInterceptorFn } from "@angular/common/http";
import { environment } from "../../../environments/environment.development";

export const ApiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes(environment.tmdbBaseUrl)) return next(req);

  const cloned = req.clone({
    params: req.params.set('api_key', environment.tmdbApiKey)
  });
  return next(cloned);
};

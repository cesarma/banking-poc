import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  // Only prepend API URL for relative paths
  if (!req.url.startsWith('http')) {
    const apiReq = req.clone({
      url: `${environment.apiUrl}${req.url}`
    });
    return next(apiReq);
  }
  return next(req);
};

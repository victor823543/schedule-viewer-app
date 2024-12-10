import { HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiReq = req.clone({ url: `https://dev-backend.royalschedule.com${req.url}` });
  return next(apiReq).pipe(
    catchError((err) => {
      console.error('HTTP Error:', err);
      const errorMessage = err.error?.message || 'An unknown error occurred';
      return throwError(() => new Error(errorMessage));
    })
  );
};

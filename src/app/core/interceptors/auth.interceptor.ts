import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
  const token = sessionStorage.getItem('kc_token');

  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        toastr.error('No tenés permisos para esta acción.');
      } else if (error.status >= 500) {
        toastr.error('Error del servidor. Intentá más tarde.');
      } else if (error.status === 0) {
        toastr.error('Sin conexión. Verificá tu red.');
      }
      return throwError(() => error);
    })
  );
};

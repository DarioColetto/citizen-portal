import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
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

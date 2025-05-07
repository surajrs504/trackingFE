import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const tokenInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = inject(AuthService).getToken();
  // Clone the request to add the authentication header.
  const newReq = req.clone({
    headers: req.headers.append('authorization', authToken),
  });
  return next(newReq);
};

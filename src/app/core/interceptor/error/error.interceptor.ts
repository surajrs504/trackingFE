import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Inject, inject } from '@angular/core';
import { catchError, retry, switchMap, throwError } from 'rxjs';
import { NotificationServiceService } from '../../services/notification/notification-service.service';
import { AuthService } from '../../services/auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationServiceService);
  const authService = inject(AuthService);
  return next(req).pipe(
    retry(1),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMessage = `Server Error [${error.status}]: ${error.message}`;
      }

      // You can use a notification service here to show error
      console.error(errorMessage);
      notificationService.showNotification(errorMessage, 5);
      if (error.status === 403) {
        notificationService.showNotification(
          'Somthing wrong with the access',
          5
        );
      }
      if (
        error.status === 401 &&
        error.message.includes('/auth/refresh-token')
      ) {
        notificationService.showNotification(
          'Session time out, please login again',
          5
        );
        authService.logout();
      }
       if (
        error.status === 401 &&
        !error.message.includes('/auth/refresh-token')
      ) {
       return authService.refreshToken().pipe(
          switchMap(newToken => {
            // 🔁 Retry the request with new token
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
            return next(retryReq);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

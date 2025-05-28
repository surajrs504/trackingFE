import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Store } from '@ngrx/store';
import { changeUserDetails } from '../../../store/loader/action';
import { environment } from '../../../../environments/environment';
import { catchError, map, of, tap } from 'rxjs';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  store = inject(Store);
  router = inject(Router);
  baseUrl = environment.baseUrl;
  accessToken: any;

  handleLoginRequest(payload: any) {
    return this.http.post(this.baseUrl + '/Auth/Login', payload, {
      withCredentials: true,
    });
  }

  handleRegisterRequest(payload: any) {
    return this.http.post(this.baseUrl + '/Auth/Register', payload);
  }

  fetchUserDetails() {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode<any>(token);
      console.log(decoded);
      this.store.dispatch(changeUserDetails({ userDetails: decoded }));
    } else {
      this.store.dispatch(changeUserDetails({ userDetails: {} }));
    }
  }

  getToken() {
    const token = localStorage.getItem('token');
    return token && token?.length > 0 ? token : 'N/A';
  }
  refreshToken() {
    return this.http
      .post(
        this.baseUrl + '/auth/refresh-token',
        {},
        { withCredentials: true, headers: new HttpHeaders() }
      )
      .pipe(
        tap((response: any) => {
          this.accessToken = response.accessToken;
        }),
        map((response: any) => response.accessToken),
        catchError((err: HttpErrorResponse) => {
          this.logout(); // or redirect to login
          return of(null);
        })
      );
  }

  logout() {
    this.router.navigate(['/login']);
    localStorage.removeItem('token');
    this.store.dispatch(changeUserDetails({ userDetails: {} }));
  }
}

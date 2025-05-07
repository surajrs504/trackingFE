import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Store } from '@ngrx/store';
import { changeUserDetails } from '../../../store/loader/action';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  store = inject(Store);

  handleLoginRequest(payload: any) {
    return this.http.post('https://localhost:7004/api/Auth/Login', payload);
  }

  handleRegisterRequest(payload: any) {
    return this.http.post('https://localhost:7004/api/Auth/Register', payload);
  }

  fetchUserDetails() {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode<any>(token);
      console.log(decoded);
      this.store.dispatch(changeUserDetails({ userDetails: decoded }));
    }else{
      this.store.dispatch(changeUserDetails({ userDetails: {} }));
    }
  }

  getToken() {
    const token = localStorage.getItem('token');
    return token && token?.length > 0 ? token : 'N/A';
  }
}

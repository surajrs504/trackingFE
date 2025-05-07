import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  constructor() {}

  http = inject(HttpClient);

  getEntitiesList() {
    return this.http.get<any>('https://localhost:7004/api/user/getTrackingUser');
  }
  getUserApprovalList() {
    return this.http.get<any>(
      'https://localhost:7004/api/auth/getUserApprovalList'
    );
  }
  getApprovedUserList() {
    return this.http.get<any>(
      'https://localhost:7004/api/auth/getUserApprovedList'
    );
  }

  getUserRejectedList() {
    return this.http.get<any>(
      'https://localhost:7004/api/auth/getUserRejectedList'
    );
  }

  approveUser(userEmail: any) {
    return this.http.post<any>(
      'https://localhost:7004/api/user/approveUser',
      userEmail
    );
  }

  rejectUser(userEmail: any) {
    return this.http.post<any>(
      'https://localhost:7004/api/user/rejectUser',
      userEmail
    );
  }
  enableUserTracking(userEmail: any) {
    return this.http.post<any>(
      'https://localhost:7004/api/User/changeTrackingStatus',
      userEmail
    );
  }
}

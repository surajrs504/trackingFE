import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  constructor() {}

  http = inject(HttpClient);
  baseUrl = environment.baseUrl;

  getUserApprovalList() {
    return this.http.get<any>(this.baseUrl + '/user/getUserApprovalList');
  }
  getApprovedUserList() {
    console.log(this.baseUrl + '/user/getUserApprovedList');
    const url = ` ${this.baseUrl}/user/getUserApprovedList`;
    return this.http.get<any>(url, {});
  }

  getUserRejectedList() {
    return this.http.get<any>(this.baseUrl + '/user/getUserRejectedList');
  }

  approveUser(userEmail: any) {
    return this.http.post<any>(this.baseUrl + '/user/approveUser', userEmail);
  }

  rejectUser(userEmail: any) {
    return this.http.post<any>(this.baseUrl + '/user/rejectUser', userEmail);
  }
  enableUserTracking(userEmail: any) {
    return this.http.post<any>(
      this.baseUrl + '/User/changeTrackingStatus',
      userEmail
    );
  }

  addVendor(payload: any) {
    return this.http.post<any>(this.baseUrl + '/user/AddVendor', payload);
  }

  getVendors() {
    return this.http.get<any>(this.baseUrl + '/user/getVendorList');
  }

  editUser(payload: any) {
    return this.http.post<any>(this.baseUrl + '/user/EditUser', payload);
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  constructor() {}

  http = inject(HttpClient);
  baseUrl = environment.baseUrl;

  getEntitiesList() {
    return this.http.get<any>(this.baseUrl + '/user/getTrackingUser');
  }
  

  getEntityHistoryDetails(payload: any) {
    return this.http.post(
      this.baseUrl + '/tracking/getEntityHistoryDetails',
      payload
    );
  }

  getReverseGeoLocationDetails(latitude: any, longitude: any) {
    return this.http.get(
      `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=681d81b72bfc8103911905qgd924273`
    );
  }
}

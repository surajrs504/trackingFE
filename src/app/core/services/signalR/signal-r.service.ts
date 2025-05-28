import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Store } from '@ngrx/store';
import { hideLoading, showLoading } from '../../../store/loader/action';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  hubConnection: signalR.HubConnection | undefined;
  http = inject(HttpClient);
  store = inject(Store);
  environment = environment.coreUrl;
  
  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.coreUrl}/trackinghub`, {
        withCredentials: true, // This ensures credentials are sent with the request
      })
      .build();
    this.store.dispatch(showLoading());
    return this.hubConnection
      .start()
      .then(() => {
        this.store.dispatch(hideLoading());
        console.log('SignalR connection started', 'hello');
      })
      .catch((err) => console.error('SignalR connection error:', err));
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.store.dispatch(showLoading());
      this.hubConnection
        .stop()
        .then(() => {
          this.store.dispatch(hideLoading());
          console.log('SignalR connection stopped');
        })
        .catch((err) => {
          this.store.dispatch(hideLoading());
          console.error('Error while stopping SignalR connection: ', err);
        });
    }
  }
  public getData(email: string) {
    console.log('calling data for ', email);
    this.store.dispatch(showLoading());
    this.hubConnection
      ?.invoke('SubscribeToLocation', email)
      .finally(() => {
        this.store.dispatch(hideLoading());
      })
      .catch((err) => console.error(err));
  }
}

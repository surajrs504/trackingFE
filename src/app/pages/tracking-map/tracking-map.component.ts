import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation,
} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { SignalRService } from '../../core/services/signalR/signal-r.service';
// import { isPlatformBrowser } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { hideLoading, showLoading } from '../../store/loader/action';
import { TrackingService } from '../../core/services/tracking/tracking.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
@Component({
  selector: 'app-tracking-map',
  standalone: true,
  imports: [
    MatSlideToggleModule,
    FormsModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './tracking-map.component.html',
  styleUrl: './tracking-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackingMapComponent implements AfterViewInit, OnInit {
  signalRService = inject(SignalRService);
  trackingService = inject(TrackingService);
  changeDetectorRef = inject(ChangeDetectorRef);
  authService = inject(AuthService);
  store = inject(Store);

  map: L.Map | undefined;
  routeCoordinates: any;
  routingControl!: L.Routing.Control;
  private polyline!: L.Polyline;
  private pathCoordinates: L.LatLng[] = [];
  isSignalREnabled = false;
  trackingEntities: any = [];
  isEntitiesPanelOpen = false;
  isSettingsPanelOpen = false;
  isRoutingEnabled = false;
  selectedUser: any;
  marker: any;
  circle: any;

  constructor() {}
  ngOnInit(): void {
    this.authService.fetchUserDetails();
  }

  ngAfterViewInit(): void {
    this.store.dispatch(showLoading());
    setTimeout(() => {
      this.initMap();
      this.store.dispatch(hideLoading());
    }, 20);
    this.getEntitiesList();
  }

  startSignalRReceiving() {
    let marker: any;
    let circle: any;

    this.signalRService?.hubConnection?.on('ReceiveLocation', (msg: any) => {
      console.log('hello in map signalr', msg);
      this.routeCoordinates = msg; // Update the message in the component
      this.changeDetectorRef.detectChanges();
      console.log(this.routeCoordinates);
      if (marker) {
        this.map?.removeLayer(marker);
      }
      marker = L.marker([msg.latitude, msg.longitude])
        .bindPopup(`<b>Email: </b><br>${msg.email}`)
        .openPopup();
      this.marker = marker;
      if (circle) {
        this.map?.removeLayer(circle);
      }
      circle = L.circle([msg.latitude, msg.longitude], { radius: 50 });
      const featureGroup = L.featureGroup([marker, circle]).addTo(this.map!);
      this.circle = circle;
      if (this.isRoutingEnabled) {
        this.pathCoordinates.push({
          lat: msg.latitude,
          lng: msg.longitude,
          equals: function (
            otherLatLng: L.LatLngExpression,
            maxMargin?: number
          ): boolean {
            throw new Error('Function not implemented.');
          },
          distanceTo: function (otherLatLng: L.LatLngExpression): number {
            throw new Error('Function not implemented.');
          },
          wrap: function (): L.LatLng {
            throw new Error('Function not implemented.');
          },
          toBounds: function (sizeInMeters: number): L.LatLngBounds {
            throw new Error('Function not implemented.');
          },
          clone: function (): L.LatLng {
            throw new Error('Function not implemented.');
          },
        });

        // Update the polyline
        this.polyline.setLatLngs(this.pathCoordinates);

        // Optionally, adjust the map view to fit the updated path
        this.map?.fitBounds(this.polyline.getBounds());
      } else {
        this.map?.fitBounds(featureGroup.getBounds());
      }
    });
  }

  initMap(): void {
    if (this.map) {
      this.map = undefined;
    }

    const url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; // URL template for tile layer
    const attribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'; // Attribution string to give credit to OpenStreetMap for using their map
    this.map = L?.map('map')?.setView([37.8, -96], 3);

    L.tileLayer(url, {
      attribution: attribution,
    }).addTo(this.map);

    this.polyline = L.polyline(this.pathCoordinates, {
      color: 'blue',
      weight: 10,
    }).addTo(this.map!);
  }
  onChange() {
    this.isRoutingEnabled = !this.isRoutingEnabled;
    if (this.isRoutingEnabled) {
      this.pathCoordinates = [];
    } else {
      this.routeCoordinates = {};
    }
  }

  handleSignalRChange() {
    this.isSignalREnabled = !this.isSignalREnabled;
    if (this.isSignalREnabled) {
      this.signalRService.startConnection();
      setTimeout(() => {
        this.startSignalRReceiving();
      }, 1000);
    } else {
      this.signalRService.stopConnection();
    }
  }

  handleCloseEntitesPanel() {
    this.isEntitiesPanelOpen = false;
  }
  handleEntitiesPanel() {
    this.isEntitiesPanelOpen = !this.isEntitiesPanelOpen;
  }
  handleCloseSettingsPanel() {
    this.isSettingsPanelOpen = false;
  }
  handleSettingsPanel() {
    this.isSettingsPanelOpen = !this.isSettingsPanelOpen;
  }

  getEntitiesList() {
    this.trackingService.getEntitiesList().subscribe({
      next: (response) => {
        this.trackingEntities = response;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.log('error while fecthing entites list');
      },
    });
  }
  handleEntityClick(entity: any) {
    if (this.marker) {
      this.map?.removeLayer(this.marker);
    }
    if (this.circle) {
      this.map?.removeLayer(this.circle);
    }
    this.selectedUser = entity.userName;
    this.signalRService.getData(entity.userName);
  }

  handleEntitiesListSync(){
    this.trackingEntities=[]
    this.getEntitiesList()
  }
}

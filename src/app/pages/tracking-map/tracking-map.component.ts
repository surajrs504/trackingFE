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
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { NotificationServiceService } from '../../core/services/notification/notification-service.service';
import { response } from 'express';
import { CommonService } from '../../core/services/common/common.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ListDialogComponent } from '../../components/list-dialog/list-dialog.component';
@Component({
  selector: 'app-tracking-map',
  standalone: true,
  providers: [DatePipe],
  imports: [
    MatSlideToggleModule,
    FormsModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSliderModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatDialogModule
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
  isEntityHistoryEnabled = false;
  isEntityHistoryPaused = true;
  sliderInterval: any;
  historySliderValue = 0;
  historySliderMaxValue = 0;
  datePipe = inject(DatePipe);
  notificationService = inject(NotificationServiceService);
  commonService = inject(CommonService);
  entityHistoryStatus = {
    speed: 'N/A',
    status: 'N/A',
    address: 'N/A',
    lastSeenTime: 'N/A',
  };
  entityLiveStatus = {
    speed: 'N/A',
    status: 'N/A',
    address: 'N/A',
    lastSeenTime: 'N/A',
  };
  entityHistory: any;
  isLiveEntityTrackingEnabled = false;
  entityLivePrevPoint: any;
  pin = L.icon({
    iconUrl: 'assets/images/pin.png',
    iconSize: [38, 40], // size of the icon
    iconAnchor: [22, 42], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
  });
  historyPlaybackSpeedValue = 1;
  historySliderDisplayValues = {
    currentTime: '00:00',
    MaxTime: '00:00',
  };

  ngOnInit(): void {
    this.authService.fetchUserDetails();
    this.handleSignalRChange();
  }

  ngAfterViewInit(): void {
    this.store.dispatch(showLoading());
    setTimeout(() => {
      this.initMap();
      this.store.dispatch(hideLoading());
      const a = document.getElementById('history-slider-Container');
      if (a) {
        a.addEventListener('mouseover', () => {
          this.map?.dragging.disable();
        });
        a.addEventListener('mouseout', () => {
          this.map?.dragging.enable();
        });
      }
      const b = document.getElementById('mdc-slider__input');
      if (b) {
        b.addEventListener('mouseover', () => {
          this.map?.dragging.disable();
        });
        b.addEventListener('mouseout', () => {
          this.map?.dragging.enable();
        });
      }
    }, 20);
    this.getEntitiesList();
  }

  startSignalRReceiving() {
    this.signalRService?.hubConnection?.on('ReceiveLocation', (msg: any) => {
      this.routeCoordinates = msg; // Update the message in the component

      this.entityLiveStatus.speed = this.getLiveSpeed(msg);

      this.entityLiveStatus.lastSeenTime = this.commonService.formatDate(
        msg.timeStampMs
      );
      if (this.entityLiveStatus.speed !== '0') {
        this.entityLiveStatus.status = 'Moving';
      } else {
        this.entityLiveStatus.status = 'Stopped';
      }
      this.changeDetectorRef.detectChanges();
      this.PlotRoutePath(msg);
      // if (marker) {
      //   this.map?.removeLayer(marker);
      // }
      // marker = L.marker([msg.latitude, msg.longitude], { icon: this.pin })
      //   .bindPopup(`<b>Email: </b><br>${msg.email}`)
      //   .openPopup();
      // this.marker = marker;
      // if (circle) {
      //   this.map?.removeLayer(circle);
      // }
      // circle = L.circle([msg.latitude, msg.longitude], { radius: 50 });
      // const featureGroup = L.featureGroup([marker, circle]).addTo(this.map!);
      // this.circle = circle;
      // if (this.isRoutingEnabled) {
      //   this.pathCoordinates.push({
      //     lat: msg.latitude,
      //     lng: msg.longitude,
      //     equals: function (
      //       otherLatLng: L.LatLngExpression,
      //       maxMargin?: number
      //     ): boolean {
      //       throw new Error('Function not implemented.');
      //     },
      //     distanceTo: function (otherLatLng: L.LatLngExpression): number {
      //       throw new Error('Function not implemented.');
      //     },
      //     wrap: function (): L.LatLng {
      //       throw new Error('Function not implemented.');
      //     },
      //     toBounds: function (sizeInMeters: number): L.LatLngBounds {
      //       throw new Error('Function not implemented.');
      //     },
      //     clone: function (): L.LatLng {
      //       throw new Error('Function not implemented.');
      //     },
      //   });

      //   // Update the polyline
      //   this.polyline.setLatLngs(this.pathCoordinates);

      //   // Optionally, adjust the map view to fit the updated path
      //   this.map?.fitBounds(this.polyline.getBounds());
      // } else {
      //   this.map?.fitBounds(featureGroup.getBounds());
      // }
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
      weight: 5,
    }).addTo(this.map!);
  }
  changeTrackingstyle() {
    this.isRoutingEnabled = !this.isRoutingEnabled;
    if (this.isRoutingEnabled) {
      this.pathCoordinates = [];
    } else {
      this.routeCoordinates = {};
    }
  }

  handleSignalRChange() {
    this.signalRService.startConnection().then(() => {
      this.startSignalRReceiving();
    });
  }

  handleCloseEntitesPanel() {
    this.isEntitiesPanelOpen = false;
  }
  readonly dialog = inject(MatDialog);

  handleEntitiesPanel() {
   
     const newWidth = window.innerWidth;
     console.log("newWidth",newWidth);
     if(newWidth<460){
 const dialogRef = this.dialog.open(ListDialogComponent,{
      data: {
       userList:this.trackingEntities,
       dialogHeader:"Entities",
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
     }else{
 this.isEntitiesPanelOpen = !this.isEntitiesPanelOpen;
     }
 
  }
  handleCloseSettingsPanel() {
    this.isSettingsPanelOpen = false;
  }
  handleSettingsPanel() {
    this.isSettingsPanelOpen = !this.isSettingsPanelOpen;
  }

  getEntitiesList() {
    this.store.dispatch(showLoading());
    this.trackingService.getEntitiesList().subscribe({
      next: (response) => {
        this.trackingEntities = response;
        this.changeDetectorRef.detectChanges();
        this.store.dispatch(hideLoading());
      },
      error: (error) => {
        this.store.dispatch(hideLoading());
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
    this.pathCoordinates = [];
    
    this.polyline.setLatLngs([]);
    this.selectedUser = entity;
    this.isLiveEntityTrackingEnabled = true;
    this.isEntityHistoryEnabled = false;
    this.signalRService.getData(entity.email);
  }

  handleEntitiesListSync() {
    this.trackingEntities = [];
    this.getEntitiesList();
  }
  handleEntityHistoryPlay() {
    if (this.entityHistory?.length > 0) {
      this.isEntityHistoryPaused = !this.isEntityHistoryPaused;

      if (!this.isEntityHistoryPaused) {
        this.sliderInterval = setInterval(() => {
          this.PlotRoutePath(this.entityHistory[this.historySliderValue]);

          this.entityHistoryStatus.speed = this.getLiveSpeed(
            this.entityHistory[this.historySliderValue]
          );
          this.historySliderDisplayValues.currentTime =
            this.commonService.convertSeconds(this.historySliderValue);

          this.historySliderValue =
            this.historySliderValue + this.historyPlaybackSpeedValue;
          this.changeDetectorRef.detectChanges();
          if (this.historySliderMaxValue - this.historySliderValue === 0) {
            clearInterval(this.sliderInterval);
          }
        }, 1000);
      } else {
        clearInterval(this.sliderInterval);
        this.entityHistoryStatus.speed = '0';
      }
    } else {
      this.notificationService.showNotification(
        'No Data Present for the Selected Date',
        5
      );
    }
  }

  handleEntityHistoryStop() {
    if (this.entityHistory?.length > 0) {
      this.isEntityHistoryPaused = true;
      this.historySliderValue = 0;
      clearInterval(this.sliderInterval);
      this.pathCoordinates = [];
      this.polyline.setLatLngs([]);
      this.entityHistoryStatus.speed = '0';
      if (this.marker) {
        this.map?.removeLayer(this.marker);
      }
      if (this.circle) {
        this.map?.removeLayer(this.circle);
      }
    } else {
      this.notificationService.showNotification(
        'No Data Present for the Selected Date',
        5
      );
    }
  }
  handleEntityHistory(entity: any) {
    this.isEntityHistoryEnabled = true;
    this.isLiveEntityTrackingEnabled = false;
    this.selectedUser = entity;
  }

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  };

  handleEntityDateChange(value: any) {
    const date = new Date(value.value);
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    const payload = {
      email: this.selectedUser.email,
      date: formattedDate,
    };
    this.store.dispatch(showLoading());
    this.trackingService.getEntityHistoryDetails(payload).subscribe({
      next: (response: any) => {
        if (response && response.length > 0) {
          this.entityHistory = response
            .filter((data: any) => data.latitude && data.longitude)
            .sort((a: any, b: any) => a.timeStampMs - b.timeStampMs);

          const lastValue = this.entityHistory[this.entityHistory.length - 1];
          this.entityHistoryStatus.lastSeenTime = this.commonService.formatDate(
            lastValue.timeStampMs
          );
          this.entityHistoryStatus.status = 'History';
          const seconds = this.calculateTimeDifference(this.entityHistory);
          this.historySliderMaxValue = seconds;
          this.historySliderDisplayValues.MaxTime =
            this.commonService.convertSeconds(this.historySliderMaxValue);

          this.changeDetectorRef.detectChanges();
        } else {
          this.notificationService.showNotification(
            'No Data Present for the Selected Date',
            5
          );
        }
        this.store.dispatch(hideLoading());
      },
      error: (error) => {
        this.store.dispatch(hideLoading());
        console.log('error on the histroy api');
        this.notificationService.showNotification(
          'Error while fetching history',
          5
        );
      },
    });
  }

  calculateTimeDifference(arr: any) {
    // Find the earliest and latest timestamp
    const earliest = arr[0].timeStampMs;
    const latest = arr[arr.length - 1]?.timeStampMs;

    // Calculate the difference in milliseconds
    const diffInMs = latest - earliest;
    // Convert the difference to minutes and seconds
    const diffInSeconds = diffInMs / 1000;
    const seconds = Math.floor(diffInSeconds);
    return arr.length;
  }

  PlotRoutePath(msg: any) {
    if (this.marker) {
      this.map?.removeLayer(this.marker);
    }

    this.marker = L.marker([msg.latitude, msg.longitude], { icon: this.pin })
      .bindPopup(`<b>Email: </b><br>${msg.email}`)
      .openPopup();

    if (this.circle) {
      this.map?.removeLayer(this.circle);
    }
    this.circle = L.circle([msg.latitude, msg.longitude], { radius: 50 });
    const featureGroup = L.featureGroup([this.marker, this.circle]).addTo(
      this.map!
    );

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
  }

  getReverseGeoLocationDetails(latitude: any, longitude: any) {
    this.trackingService
      .getReverseGeoLocationDetails(latitude, longitude)
      .subscribe({
        next: (response: any) => {
          if (this.isEntityHistoryEnabled) {
            if (response.address) {
              this.entityHistoryStatus.address = `${response.address.neighbourhood}, ${response.address.city}`;
            } else {
              this.entityHistoryStatus.address = 'N/A';
            }
          }
          if (this.isLiveEntityTrackingEnabled) {
            if (response.address) {
              this.entityLiveStatus.address = `${response.address.neighbourhood}, ${response.address.city}`;
            } else {
              this.entityLiveStatus.address = 'N/A';
            }
          }

          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {},
      });
  }

  getAvgSpeed(locations: any) {
    let totalDistance = 0;
    const startTime = locations[0].timeStampMs;
    const endTime = locations[locations.length - 1].timeStampMs;
    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];

      totalDistance += this.commonService.haversine(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }
    const totalTimeHours = (endTime - startTime) / (1000 * 60 * 60); // ms to hours
    const avgSpeed = totalDistance / totalTimeHours;
    return avgSpeed.toFixed(2);
  }

  getLiveSpeed(currentPoint: any) {
    if (!this.entityLivePrevPoint) {
      this.entityLivePrevPoint = currentPoint;
      return '0'; // no speed on first point
    }

    const distance = this.commonService.haversine(
      this.entityLivePrevPoint.latitude,
      this.entityLivePrevPoint.longitude,
      currentPoint.latitude,
      currentPoint.longitude
    ); // in km

    const timeDiff =
      (currentPoint.timeStampMs - this.entityLivePrevPoint.timeStampMs) /
      (1000 * 60 * 60); // in hours

    this.entityLivePrevPoint = currentPoint;

    if (timeDiff === 0) return '0'; // avoid division by zero
    const speed = distance / timeDiff;
    return speed.toFixed(2); // km/h
  }

  handleHistorySliderDrag(value: any) {
    this.historySliderValue = value;
  }

  handleHistoryPlaybackSpeed(playbackSpeed: any) {
    this.historyPlaybackSpeedValue =
      playbackSpeed === '1x' ? 1 : playbackSpeed === '2x' ? 2 : 5;
    this.handleEntityHistoryPlay();
  }
  isEntityChatWindowOpen=false
  handleEntityChat(enitity:any){
    this.selectedUser=enitity
    this.isEntityChatWindowOpen=true
  }
}

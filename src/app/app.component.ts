import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalRService } from './core/services/signalR/signal-r.service';
import { TrackingMapComponent } from './pages/tracking-map/tracking-map.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  signalRService = inject(SignalRService);
authService = inject(AuthService);
  message: any;
  ngOnInit() {
    this.handleUserDetails()
  }

  handleUserDetails(){
    this.authService.fetchUserDetails()
  }
}

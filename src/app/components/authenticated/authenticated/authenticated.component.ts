import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import {
  selectLoading,
  selectUserDetails,
} from '../../../store/loader/selectors';
import { MatTooltipModule } from '@angular/material/tooltip';
import { response } from 'express';
import { changeUserDetails } from '../../../store/loader/action';
@Component({
  selector: 'app-authenticated',
  standalone: true,
  imports: [
    MatButtonModule,
    MatSidenavModule,
    MatMenuModule,
    RouterOutlet,
    MatIconModule,
    MatToolbarModule,
    CommonModule,
    MatTooltipModule,
  ],
  templateUrl: './authenticated.component.html',
  styleUrl: './authenticated.component.scss',
})
export class AuthenticatedComponent implements OnInit {
  menuOptions: any[] = [];
  router = inject(Router);
  store = inject(Store);
  loading$: Observable<boolean> = this.store.select(selectLoading);
  userDetails$ = this.store.select(selectUserDetails);
  isCollapsed=true

  ngOnInit(): void {
    this.userDetails$.subscribe({
      next: (response) => {
        if (response.role === 'User') {
          this.menuOptions = [
            { name: 'Tracking', route: '/a/tracking', icon: 'location_on' },
          ];
        }
        if (response.role === 'Admin') {
          this.menuOptions = [
            { name: 'Tracking', route: '/a/tracking', icon: 'location_on' },
            {
              name: 'User Management',
              route: '/a/userManagement',
              icon: 'manage_accounts',
            },
            {
              name: 'Support',
              route: '/a/support-tickets',
              icon: 'support_agent',
            },
            {
              name: 'Vehicle Asistance',
              route: '/a/userManagement',
              icon: 'toys',
            },
            {
              name: 'Subscription',
              route: '/a/userManagement',
              icon: 'payments',
            },
          ];
        }
        this.selectedOption = this.menuOptions[0];
      },
    });
  }

  handleProfileMenu(option: any) {
    if (option === 'logout') {
      this.router.navigate(['/login']);
      localStorage.removeItem('token');
      this.store.dispatch(changeUserDetails({ userDetails: {} }));
    }
  }

  selectedOption: any;
  handleSidenavPageChange(option: any) {
    this.selectedOption = option;
    this.router.navigate([option.route]);
  }
  handleMenuExpand(){
    this.isCollapsed = false;
  }
   handleMenuCollapse(){
    this.isCollapsed = true;
  }
   handleToggle(){
    this.isCollapsed = !this.isCollapsed;
  }
}

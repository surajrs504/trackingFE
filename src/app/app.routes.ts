import { Routes } from '@angular/router';
import { TrackingMapComponent } from './pages/tracking-map/tracking-map.component';
import { LoginComponent } from './components/auth/components/login/login.component';
import { AuthenticatedComponent } from './components/authenticated/authenticated/authenticated.component';
import { AuthComponent } from './components/auth/page/auth/auth.component';
import { RegisterComponent } from './components/auth/components/register/register.component';
import { UserManagementComponent } from './pages/userManagement/user-management/user-management.component';
import { HomeComponent } from './pages/home/home.component';
import { SupportComponent } from './pages/support/support.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },

  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'a',
    component: AuthenticatedComponent,
    children: [
      { path: 'tracking', component: TrackingMapComponent },
      { path: 'userManagement', component: UserManagementComponent },
      { path: 'support-tickets', component: SupportComponent },
    ],
  },
];

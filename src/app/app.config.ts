import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { uiReducer } from './store/loader/reducer';
import { provideNativeDateAdapter } from '@angular/material/core';
import { tokenInterceptorInterceptor } from './core/interceptor/token/token-interceptor.interceptor';
import { errorInterceptor } from './core/interceptor/error/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient( withInterceptors([tokenInterceptorInterceptor,errorInterceptor]),),
    provideAnimationsAsync(),
    provideAnimationsAsync(),
    provideStore({ ui: uiReducer}),
    provideEffects(),
    provideStoreDevtools(),
    provideNativeDateAdapter(),
    
  ],
};

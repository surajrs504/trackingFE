import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationServiceService } from '../../../../core/services/notification/notification-service.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registerForm: FormGroup;
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  notificationService = inject(NotificationServiceService);
  hidePassword = false;

  constructor() {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    const payload= {...this.registerForm.value, role:'user'}
    this.authService.handleRegisterRequest(payload).subscribe({
      next: (response: any) => {
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        this.notificationService.showNotification(error?.error, 5);
        console.log('error in register', error);
      },
    });
  }

  handleNavigateLoginPage() {
    this.router.navigate(['/login']);
  }
}

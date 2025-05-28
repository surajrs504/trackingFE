import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationServiceService } from '../../../../core/services/notification/notification-service.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  router = inject(Router);
  authService = inject(AuthService);
  hidePassword = false;
  formBuilder = inject(FormBuilder);
  loginForm: FormGroup;
  notificationService = inject(NotificationServiceService);

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

 
  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Form Submitted', this.loginForm.value);
      this.authService.handleLoginRequest(this.loginForm.value).subscribe({
        next: (response: any) => {
          localStorage.setItem('token', response?.jwtToken);

          this.router.navigate(['/a/tracking']);
        },
        error: (error: any) => {
          console.log(error);
          this.notificationService.showNotification(error?.error, 5);
        },
      });
    }
  }

  handleNavigateRegisterPage() {
    this.router.navigate(['/register']);
  }
}

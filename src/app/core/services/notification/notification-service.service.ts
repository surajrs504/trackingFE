import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
@Injectable({
  providedIn: 'root',
})
export class NotificationServiceService {
  snackBar = inject(MatSnackBar);

  showNotification(message: string, time: number) {
    this.snackBar.open(message, 'X', {
      duration: time * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }
}

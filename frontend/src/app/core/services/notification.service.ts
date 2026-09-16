import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 4000,
      panelClass: ['bg-emerald-600', 'text-white'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 6000,
      panelClass: ['bg-rose-600', 'text-white'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  showInfo(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 4000,
      panelClass: ['bg-blue-600', 'text-white'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}

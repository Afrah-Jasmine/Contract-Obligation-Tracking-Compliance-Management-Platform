import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  template: `
    <div class="auth-page-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Forgot Password</mat-card-title>
          <mat-card-subtitle>Password Reset Instructions</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="py-4">
          <p class="text-slate-600">Password resets must be initiated by an Administrator or via authorized security protocol.</p>
          <div class="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p class="text-xs text-slate-500">Please reach out to support&#64;contractiq.com or your System Administrator to reset your credentials.</p>
          </div>
        </mat-card-content>
        <mat-card-actions class="justify-end">
          <a mat-button color="primary" routerLink="/login">Back to Login</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-page-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0f172a;
      padding: 16px;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 16px;
    }
  `]
})
export class ForgotPasswordComponent {}

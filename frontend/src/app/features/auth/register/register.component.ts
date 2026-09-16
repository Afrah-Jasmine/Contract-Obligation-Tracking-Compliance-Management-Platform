import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="auth-page-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>User Registration</mat-card-title>
          <mat-card-subtitle>ContractIQ Platform Account Registration</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content class="py-4">
          <p class="text-slate-600">New user registration is managed by system Administrators in accordance with RBAC security policies.</p>
          <div class="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p class="text-xs text-slate-500">Contact your Administrator or Legal Manager to request account credentials.</p>
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
export class RegisterComponent {}

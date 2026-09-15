import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth.service';
import { apiErrorMessage } from '../../core/error.util';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card">
        <div class="logo">CIQ</div>
        <h1>Reset password</h1>
        <p class="muted">Use your registered email and choose a new password.</p>
        <div class="error" *ngIf="error()">{{ error() }}</div>
        <div class="success" *ngIf="success()">If the account exists, the password has been reset. You can sign in now.</div>
        <form [formGroup]="form" (ngSubmit)="submit()" *ngIf="!success()">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email">
            <mat-error>Enter a valid email address.</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>New password</mat-label>
            <input matInput type="password" formControlName="new_password" autocomplete="new-password">
            <mat-hint>At least 6 characters.</mat-hint>
            <mat-error>Use at least 6 characters.</mat-error>
          </mat-form-field>
          <button mat-flat-button color="primary" class="submit" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Resetting…' : 'Reset password' }}
          </button>
        </form>
        <p class="switch"><a routerLink="/login">Back to sign in</a></p>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-page{min-height:100vh;display:grid;place-items:center;background:var(--ink);padding:24px}
    .auth-card{width:min(430px,100%);padding:34px;background:#fff}
    .logo{width:44px;height:32px;display:grid;place-items:center;background:var(--ink);color:#fff;border-radius:4px;font:600 12px var(--font-mono);margin:0 auto 12px}
    h1{text-align:center;font-family:var(--font-display);font-size:28px;margin:0}.muted{text-align:center;margin:4px 0 24px}
    mat-form-field{display:block;margin-bottom:5px}.submit{width:100%;height:46px;margin-top:8px}
    .error,.success{padding:10px 12px;border-radius:4px;margin-bottom:14px;font-size:13px}
    .error{background:var(--rose-soft);color:var(--rose);border:1px solid #e3bcb7}.success{background:var(--seal-soft);color:var(--seal);border:1px solid #bcd6cc}
    .switch{text-align:center;font-size:13px;color:var(--ink-soft);margin:18px 0 0}.switch a{color:var(--seal);font-weight:600}
  `]
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  loading = signal(false);
  error = signal('');
  success = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    new_password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.resetPassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(apiErrorMessage(err, 'Unable to reset the password.'));
      }
    });
  }
}

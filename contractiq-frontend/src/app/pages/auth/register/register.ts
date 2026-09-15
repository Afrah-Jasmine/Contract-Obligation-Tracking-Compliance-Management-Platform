import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  fullName = '';
  email = '';
  password = '';
  role: UserRole = 'Contract Manager';
  error = '';
  success = '';
  loading = false;

  roles: UserRole[] = [
    'Administrator',
    'Legal Manager',
    'Compliance Officer',
    'Contract Manager',
    'Department Head',
    'Viewer'
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  register(): void {
    if (!this.fullName.trim() || !this.email.trim() || !this.password.trim()) {
      this.error = 'Please fill out all required fields.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.register({
      full_name: this.fullName.trim(),
      email: this.email.trim(),
      password: this.password,
      role: this.role
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.success = 'Account created successfully! Redirecting to login...';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        const detail = err?.error?.detail;
        if (typeof detail === 'string') {
          this.error = detail;
        } else if (Array.isArray(detail)) {
          this.error = detail.map((d: any) => d.msg || d).join(', ');
        } else {
          this.error = 'Failed to create user account.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}

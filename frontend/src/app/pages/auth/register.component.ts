import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth.service';
import { USER_ROLES, UserRole } from '../../core/models';
import { apiErrorMessage } from '../../core/error.util';

@Component({
  selector:'app-register',standalone:true,
  imports:[CommonModule,ReactiveFormsModule,RouterLink,MatCardModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatButtonModule],
  template:`
  <div class="auth-page"><mat-card class="auth-card">
    <div class="logo">CIQ</div><h1>Create account</h1><p class="muted">Set up a ContractIQ user</p>
    <div class="error" *ngIf="error()">{{error()}}</div><div class="success" *ngIf="success()">Account created. Sign in to continue.</div>
    <form [formGroup]="form" (ngSubmit)="submit()" *ngIf="!success()">
      <mat-form-field appearance="outline"><mat-label>Full name</mat-label><input matInput formControlName="full_name">
        <mat-error>Full name is required.</mat-error></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput type="email" formControlName="email">
        <mat-error>Enter a valid email.</mat-error></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Password</mat-label><input matInput type="password" formControlName="password">
        <mat-hint>At least 6 characters.</mat-hint><mat-error>Use at least 6 characters.</mat-error></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Role</mat-label><mat-select formControlName="role">
        <mat-option *ngFor="let r of roles" [value]="r">{{r}}</mat-option>
      </mat-select></mat-form-field>
      <button mat-flat-button color="primary" class="submit" [disabled]="form.invalid||loading()">{{loading()?'Creating…':'Create account'}}</button>
    </form>
    <p class="switch">Already registered? <a routerLink="/login">Sign in</a></p>
  </mat-card></div>`,
  styles:[`
    .auth-page{min-height:100vh;display:grid;place-items:center;background:var(--ink);padding:24px}.auth-card{width:min(440px,100%);padding:32px;background:#fff}
    .logo{width:44px;height:32px;display:grid;place-items:center;background:var(--ink);color:#fff;border-radius:4px;font:600 12px var(--font-mono);margin:0 auto 12px}
    h1{text-align:center;font-family:var(--font-display);font-size:26px;margin:0}.muted{text-align:center;margin:4px 0 22px}
    mat-form-field{display:block;margin-bottom:4px}.submit{width:100%;height:46px;margin-top:8px}.switch{text-align:center;font-size:13px;color:var(--ink-soft);margin:18px 0 0}.switch a{color:var(--seal);font-weight:600}
    .error,.success{padding:10px 12px;border-radius:4px;font-size:13px;margin-bottom:14px}.error{background:var(--rose-soft);color:var(--rose);border:1px solid #e3bcb7}.success{background:var(--seal-soft);color:var(--seal);border:1px solid #bcd6cc}
  `]
})
export class RegisterComponent {
  private auth=inject(AuthService); private router=inject(Router); private fb=inject(FormBuilder);
  roles=USER_ROLES; loading=signal(false); error=signal(''); success=signal(false);
  form=this.fb.nonNullable.group({
    full_name:['',[Validators.required,Validators.minLength(2)]],
    email:['',[Validators.required,Validators.email]],
    password:['',[Validators.required,Validators.minLength(6)]],
    role:['Employee' as UserRole,[Validators.required]]
  });
  submit(){
    if(this.form.invalid){this.form.markAllAsTouched();return}
    this.loading.set(true);this.error.set('');
    this.auth.register(this.form.getRawValue()).subscribe({
      next:()=>{this.loading.set(false);this.success.set(true);},
      error:e=>{this.loading.set(false);this.error.set(e.status===400?'That email is already registered.':apiErrorMessage(e,'Unable to create the account.'))}
    });
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth.service';
import { apiErrorMessage } from '../../core/error.util';

@Component({
  selector:'app-login', standalone:true,
  imports:[CommonModule,ReactiveFormsModule,RouterLink,MatCardModule,MatFormFieldModule,MatInputModule,MatButtonModule,MatIconModule],
  template:`
  <div class="auth-page">
    <mat-card class="auth-card">
      <div class="logo">CIQ</div>
      <h1>ContractIQ</h1><p class="muted">Contract, obligation and compliance register</p>
      <div class="error" *ngIf="error()">{{ error() }}</div>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput type="email" formControlName="email" autocomplete="email">
          <mat-error>Enter a valid email address.</mat-error></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Password</mat-label><input matInput [type]="hide ? 'password':'text'" formControlName="password" autocomplete="current-password">
          <button mat-icon-button matSuffix type="button" (click)="hide=!hide"><mat-icon>{{hide?'visibility':'visibility_off'}}</mat-icon></button>
          <mat-error>Password is required.</mat-error></mat-form-field>
        <button mat-flat-button color="primary" class="submit" [disabled]="form.invalid || loading()">{{loading()?'Signing in…':'Sign in'}}</button>
      </form>
      <p class="switch">New to ContractIQ? <a routerLink="/register">Create an account</a></p>
    </mat-card>
  </div>`,
  styles:[`
    .auth-page{min-height:100vh;display:grid;place-items:center;background:var(--ink);padding:24px}
    .auth-card{width:min(430px,100%);padding:34px;background:#fff}
    .logo{width:44px;height:32px;display:grid;place-items:center;background:var(--ink);color:#fff;border-radius:4px;font:600 12px var(--font-mono);margin:0 auto 12px}
    h1{text-align:center;font-family:var(--font-display);font-size:28px;margin:0}.muted{text-align:center;margin:4px 0 24px}
    mat-form-field{display:block;margin-bottom:5px}.submit{width:100%;height:46px;margin-top:8px}
    .error{padding:10px 12px;background:var(--rose-soft);color:var(--rose);border:1px solid #e3bcb7;border-radius:4px;margin-bottom:14px;font-size:13px}
    .switch{text-align:center;font-size:13px;color:var(--ink-soft);margin:18px 0 0}.switch a{color:var(--seal);font-weight:600}
  `]
})
export class LoginComponent {
  private auth=inject(AuthService); private router=inject(Router); private fb=inject(FormBuilder);
  hide=true; loading=signal(false); error=signal('');
  form=this.fb.nonNullable.group({email:['',[Validators.required,Validators.email]],password:['',[Validators.required,Validators.minLength(6)]]});
  submit(){
    if(this.form.invalid){this.form.markAllAsTouched();return}
    this.error.set('');this.loading.set(true);
    const {email,password}=this.form.getRawValue();
    this.auth.login(email,password).subscribe({
      next:()=>this.auth.fetchMe().subscribe({next:()=>{this.loading.set(false);this.router.navigateByUrl('/dashboard')},error:()=>{this.loading.set(false);this.auth.logout();this.error.set('Signed in, but the user profile could not be loaded.')}}),
      error:e=>{this.loading.set(false);this.error.set(e.status===401?'Incorrect email or password.':apiErrorMessage(e,'Unable to sign in.'))}
    });
  }
}

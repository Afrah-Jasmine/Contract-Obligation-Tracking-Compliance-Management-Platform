import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth.service';
import { UsersService } from '../../core/data.service';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-profile',standalone:true,
 imports:[CommonModule,ReactiveFormsModule,MatCardModule,MatFormFieldModule,MatInputModule,MatButtonModule],
 template:`
 <h1>Profile</h1><p class="muted">Your ContractIQ account information.</p>
 <mat-card class="card"><form [formGroup]="form" (ngSubmit)="save()"><mat-form-field appearance="outline"><mat-label>Full name</mat-label><input matInput formControlName="full_name"><mat-error>Name is required.</mat-error></mat-form-field><mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput [value]="auth.user()?.email" disabled></mat-form-field><mat-form-field appearance="outline"><mat-label>Role</mat-label><input matInput [value]="auth.user()?.role" disabled></mat-form-field><button mat-flat-button color="primary" [disabled]="form.invalid||saving()">{{saving()?'Saving…':'Save profile'}}</button></form><div class="success" *ngIf="success()">Profile updated.</div><div class="error" *ngIf="error()">{{error()}}</div></mat-card>
 `,
 styles:[`.card{max-width:650px;padding:24px;margin-top:18px}.card mat-form-field{display:block}.success,.error{margin-top:14px;padding:10px 12px;border-radius:4px;font-size:13px}.success{background:var(--seal-soft);color:var(--seal)}.error{background:var(--rose-soft);color:var(--rose)}`]
})
export class ProfileComponent {
 auth=inject(AuthService);private users=inject(UsersService);private fb=inject(FormBuilder);saving=signal(false);success=signal(false);error=signal('');
 form=this.fb.nonNullable.group({full_name:[this.auth.user()?.full_name??'',[Validators.required,Validators.minLength(2)]]});
 save(){if(this.form.invalid)return;this.saving.set(true);this.success.set(false);this.error.set('');this.users.updateMe(this.form.getRawValue()).subscribe({next:u=>{this.auth.setUser(u);this.saving.set(false);this.success.set(true)},error:e=>{this.saving.set(false);this.error.set(apiErrorMessage(e,'Unable to update profile.'))}})}
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContractsService } from '../../core/data.service';
import { CONTRACT_CATEGORIES, ContractCategory } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-contract-form',standalone:true,
 imports:[CommonModule,ReactiveFormsModule,RouterLink,MatButtonModule,MatCardModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatProgressSpinnerModule,PageHeaderComponent,LoadingStateComponent],
 template:`
 <app-page-header [title]="editingId?'Edit contract':'New contract'" [subtitle]="editingId?'Update the terms on file.':'Add a contract to the repository.'"><a mat-stroked-button routerLink="/contracts">Cancel</a></app-page-header>
 <div class="error" *ngIf="error()">{{error()}}</div><app-loading-state *ngIf="loadingForm()"></app-loading-state>
 <mat-card class="form-card" *ngIf="!loadingForm()"><form [formGroup]="form" (ngSubmit)="submit()">
   <div class="row">
    <mat-form-field appearance="outline"><mat-label>Title</mat-label><input matInput formControlName="title"><mat-error>Title is required.</mat-error></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>Contract number</mat-label><input matInput formControlName="contract_number" placeholder="CIQ-2026-0143"><mat-error>Contract number is required.</mat-error></mat-form-field>
   </div>
   <mat-form-field appearance="outline"><mat-label>Category</mat-label><mat-select formControlName="category"><mat-option *ngFor="let c of categories" [value]="c">{{c}}</mat-option></mat-select></mat-form-field>
   <mat-form-field appearance="outline"><mat-label>Description</mat-label><textarea matInput rows="4" formControlName="description" placeholder="Scope, parties, key terms…"></textarea></mat-form-field>
   <div class="row">
    <mat-form-field appearance="outline"><mat-label>Start date</mat-label><input matInput type="date" formControlName="start_date"><mat-error>Start date is required.</mat-error></mat-form-field>
    <mat-form-field appearance="outline"><mat-label>End date</mat-label><input matInput type="date" formControlName="end_date"><mat-error>End date is required and must be after start date.</mat-error></mat-form-field>
   </div>
   <div class="actions"><button mat-stroked-button type="button" routerLink="/contracts">Cancel</button><button mat-flat-button color="primary" type="submit" [disabled]="form.invalid||saving()">{{saving()?'Saving…':(editingId?'Save changes':'Create contract')}}</button></div>
 </form></mat-card>
 `,
 styles:[`.form-card{max-width:760px;padding:24px}.row{display:grid;grid-template-columns:1fr 1fr;gap:14px}.form-card mat-form-field{width:100%}.actions{display:flex;justify-content:flex-end;gap:10px;margin-top:6px}.error{background:var(--rose-soft);color:var(--rose);padding:10px 12px;border-radius:4px;margin-bottom:12px;font-size:13px}@media(max-width:650px){.row{grid-template-columns:1fr}}`]
})
export class ContractFormComponent implements OnInit {
 private svc=inject(ContractsService);private route=inject(ActivatedRoute);private router=inject(Router);private fb=inject(FormBuilder);
 editingId:number|null=null;categories=CONTRACT_CATEGORIES;loadingForm=signal(false);saving=signal(false);error=signal('');
 form=this.fb.nonNullable.group({title:['',[Validators.required,Validators.minLength(2)]],contract_number:['',[Validators.required]],category:['Service Agreement' as ContractCategory,[Validators.required]],description:[''],start_date:['',[Validators.required]],end_date:['',[Validators.required]]});
 ngOnInit(){const id=Number(this.route.snapshot.paramMap.get('id'));if(id){this.editingId=id;this.loadingForm.set(true);this.svc.get(id).subscribe({next:c=>{this.form.patchValue({title:c.title,contract_number:c.contract_number,category:c.category,description:c.description??'',start_date:c.start_date,end_date:c.end_date});this.form.controls.contract_number.disable();this.loadingForm.set(false)},error:e=>{this.loadingForm.set(false);this.error.set(apiErrorMessage(e,'Unable to load contract.'))}})}}
 submit(){if(this.form.invalid){this.form.markAllAsTouched();return}const raw=this.form.getRawValue();if(raw.end_date<=raw.start_date){this.form.controls.end_date.setErrors({dateOrder:true});this.error.set('End date must be after start date.');return}this.saving.set(true);this.error.set('');const payload:any={title:raw.title,category:raw.category,description:raw.description||null,start_date:raw.start_date,end_date:raw.end_date};const req=this.editingId?this.svc.update(this.editingId,payload):this.svc.create({...payload,contract_number:raw.contract_number});req.subscribe({next:c=>{this.saving.set(false);this.router.navigate(['/contracts',c.id])},error:e=>{this.saving.set(false);this.error.set(apiErrorMessage(e,'Unable to save the contract.'))}})}
}

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
import { ContractsService, ObligationsService } from '../../core/data.service';
import { ContractListItem, OBLIGATION_TYPES, ObligationType } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-obligation-form',standalone:true,
 imports:[CommonModule,ReactiveFormsModule,RouterLink,MatButtonModule,MatCardModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatProgressSpinnerModule,PageHeaderComponent,LoadingStateComponent],
 template:`
 <app-page-header [title]="editingId?'Edit obligation':'Register obligation'" subtitle="Track a deliverable, payment, reporting or compliance commitment."><a mat-stroked-button routerLink="/obligations">Cancel</a></app-page-header>
 <div class="error" *ngIf="error()">{{error()}}</div><app-loading-state *ngIf="loadingForm()"></app-loading-state>
 <mat-card class="form-card" *ngIf="!loadingForm()"><form [formGroup]="form" (ngSubmit)="submit()">
 <mat-form-field appearance="outline"><mat-label>Contract</mat-label><mat-select formControlName="contract_id"><mat-option *ngFor="let c of contracts()" [value]="c.id">{{c.contract_number}} — {{c.title}}</mat-option></mat-select><mat-error>Select a contract.</mat-error></mat-form-field>
 <mat-form-field appearance="outline"><mat-label>Title</mat-label><input matInput formControlName="title"><mat-error>Title is required.</mat-error></mat-form-field>
 <mat-form-field appearance="outline"><mat-label>Obligation type</mat-label><mat-select formControlName="obligation_type"><mat-option *ngFor="let t of types" [value]="t">{{t}}</mat-option></mat-select></mat-form-field>
 <mat-form-field appearance="outline"><mat-label>Due date</mat-label><input matInput type="date" formControlName="due_date"><mat-error>Due date is required.</mat-error></mat-form-field>
 <mat-form-field appearance="outline"><mat-label>Description</mat-label><textarea matInput rows="4" formControlName="description"></textarea></mat-form-field>
 <div class="actions"><button mat-stroked-button type="button" routerLink="/obligations">Cancel</button><button mat-flat-button color="primary" [disabled]="form.invalid||saving()">{{saving()?'Saving…':(editingId?'Save changes':'Register obligation')}}</button></div>
 </form></mat-card>
 `,
 styles:[`.form-card{max-width:720px;padding:24px}.form-card mat-form-field{width:100%}.actions{display:flex;justify-content:flex-end;gap:10px}.error{background:var(--rose-soft);color:var(--rose);padding:10px 12px;border-radius:4px;margin-bottom:12px;font-size:13px}`]
})
export class ObligationFormComponent implements OnInit {
 private svc=inject(ObligationsService);private contractsSvc=inject(ContractsService);private route=inject(ActivatedRoute);private router=inject(Router);private fb=inject(FormBuilder);
 contracts=signal<ContractListItem[]>([]);editingId:number|null=null;loadingForm=signal(false);saving=signal(false);error=signal('');types=OBLIGATION_TYPES;
 form=this.fb.nonNullable.group({contract_id:[0,[Validators.required,Validators.min(1)]],title:['',[Validators.required,Validators.minLength(2)]],obligation_type:['Payment Obligation' as ObligationType,[Validators.required]],due_date:['',[Validators.required]],description:['']});
 ngOnInit(){this.contractsSvc.list().subscribe({next:x=>this.contracts.set(x),error:e=>this.error.set(apiErrorMessage(e,'Unable to load contracts.'))});const qp=this.route.snapshot.queryParamMap.get('contractId');const id=Number(this.route.snapshot.paramMap.get('id'));if(qp&&!id)this.form.patchValue({contract_id:Number(qp)});if(id){this.editingId=id;this.loadingForm.set(true);this.svc.get(id).subscribe({next:o=>{this.form.patchValue({contract_id:o.contract_id,title:o.title,obligation_type:o.obligation_type,due_date:o.due_date,description:o.description??''});this.loadingForm.set(false)},error:e=>{this.loadingForm.set(false);this.error.set(apiErrorMessage(e,'Unable to load obligation.'))}})}}
 submit(){if(this.form.invalid){this.form.markAllAsTouched();return}this.saving.set(true);this.error.set('');const p=this.form.getRawValue();const req=this.editingId?this.svc.update(this.editingId,p):this.svc.create(p);req.subscribe({next:o=>{this.saving.set(false);this.router.navigate(['/obligations',o.id])},error:e=>{this.saving.set(false);this.error.set(apiErrorMessage(e,'Unable to save the obligation.'))}})}
}

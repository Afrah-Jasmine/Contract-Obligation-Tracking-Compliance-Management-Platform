import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ContractsService, RenewalsService } from '../../core/data.service';
import { ContractListItem } from '../../core/models';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { AuthService } from '../../core/auth.service';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-renewal-form',standalone:true,
 imports:[CommonModule,ReactiveFormsModule,RouterLink,MatButtonModule,MatCardModule,MatFormFieldModule,MatInputModule,MatSelectModule,LoadingStateComponent,PageHeaderComponent],
 template:`
 <app-page-header title="New renewal" subtitle="Create a renewal record linked to an existing contract."><a mat-stroked-button routerLink="/renewals">Cancel</a></app-page-header>
 <div class="error" *ngIf="error()">{{error()}}</div><app-loading-state *ngIf="loading()"></app-loading-state>
 <mat-card class="form-card" *ngIf="!loading()"><form [formGroup]="form" (ngSubmit)="submit()">
 <mat-form-field appearance="outline"><mat-label>Contract</mat-label><mat-select formControlName="contract_id"><mat-option *ngFor="let c of contracts()" [value]="c.id">{{c.contract_number}} — {{c.title}}</mat-option></mat-select><mat-error>Select a contract.</mat-error></mat-form-field>
 <div class="row"><mat-form-field appearance="outline"><mat-label>Renewal date</mat-label><input matInput type="date" formControlName="renewal_date"></mat-form-field><mat-form-field appearance="outline"><mat-label>Previous expiry date</mat-label><input matInput type="date" formControlName="previous_expiry_date"></mat-form-field></div>
 <mat-form-field appearance="outline"><mat-label>New expiry date</mat-label><input matInput type="date" formControlName="new_expiry_date"></mat-form-field>
 <mat-form-field appearance="outline"><mat-label>Assigned user</mat-label><input matInput [value]="auth.user()?.full_name || 'Current user'" disabled><mat-hint>The renewal is assigned to your current account.</mat-hint></mat-form-field>
 <mat-form-field appearance="outline"><mat-label>Notes</mat-label><textarea matInput rows="4" formControlName="notes"></textarea></mat-form-field>
 <div class="actions"><button mat-stroked-button type="button" routerLink="/renewals">Cancel</button><button mat-flat-button color="primary" [disabled]="form.invalid||saving()">{{saving()?'Saving…':'Create renewal'}}</button></div>
 </form></mat-card>
 `,
 styles:[`.form-card{max-width:760px;padding:24px}.form-card mat-form-field{width:100%}.row{display:grid;grid-template-columns:1fr 1fr;gap:14px}.actions{display:flex;justify-content:flex-end;gap:10px}.error{background:var(--rose-soft);color:var(--rose);padding:10px 12px;border-radius:4px;margin-bottom:12px;font-size:13px}@media(max-width:650px){.row{grid-template-columns:1fr}}`]
})
export class RenewalFormComponent implements OnInit {
 private svc=inject(RenewalsService);private contractsSvc=inject(ContractsService);private route=inject(ActivatedRoute);private router=inject(Router);private fb=inject(FormBuilder);auth=inject(AuthService);
 contracts=signal<ContractListItem[]>([]);loading=signal(false);saving=signal(false);error=signal('');
 form=this.fb.nonNullable.group({contract_id:[0,[Validators.required,Validators.min(1)]],renewal_date:['',[Validators.required]],previous_expiry_date:['',[Validators.required]],new_expiry_date:['',[Validators.required]],notes:['']});
 ngOnInit(){this.loading.set(true);this.contractsSvc.list().subscribe({next:x=>{this.contracts.set(x);this.loading.set(false)},error:e=>{this.loading.set(false);this.error.set(apiErrorMessage(e,'Unable to load contracts.'))}});const qp=this.route.snapshot.queryParamMap.get('contractId');if(qp)this.form.patchValue({contract_id:Number(qp)});}
 submit(){if(this.form.invalid){this.form.markAllAsTouched();return}const p={...this.form.getRawValue(),assigned_to:this.auth.user()?.id};if(!p.assigned_to){this.error.set('Your user profile is not available. Please sign in again.');return}if(p.new_expiry_date<=p.renewal_date||p.new_expiry_date<=p.previous_expiry_date){this.error.set('New expiry date must be later than both renewal date and previous expiry date.');return}this.saving.set(true);this.error.set('');this.svc.create(p).subscribe({next:r=>{this.saving.set(false);this.router.navigate(['/contracts',r.contract_id])},error:e=>{this.saving.set(false);this.error.set(apiErrorMessage(e,'Unable to create renewal.'))}})}
}

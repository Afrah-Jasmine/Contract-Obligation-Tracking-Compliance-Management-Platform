import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportsService } from '../../core/data.service';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state.component';
import { apiErrorMessage } from '../../core/error.util';

@Component({
 selector:'app-reports',standalone:true,
 imports:[CommonModule,FormsModule,MatButtonModule,MatCardModule,MatFormFieldModule,MatInputModule,MatProgressSpinnerModule,PageHeaderComponent,LoadingStateComponent],
 template:`
 <app-page-header title="Reports & Analytics" subtitle="Business-ready summaries from the live ContractIQ register."><div class="exports"><button mat-stroked-button (click)="download('contracts','excel')">Contracts Excel</button><button mat-stroked-button (click)="download('compliance','pdf')">Compliance PDF</button></div></app-page-header>
 <div class="filters"><mat-form-field appearance="outline"><mat-label>From date</mat-label><input matInput type="date" [(ngModel)]="fromDate"></mat-form-field><mat-form-field appearance="outline"><mat-label>To date</mat-label><input matInput type="date" [(ngModel)]="toDate"></mat-form-field><button mat-flat-button color="primary" (click)="load()" [disabled]="loading()">Apply</button></div>
 <div class="error" *ngIf="error()">{{error()}}</div><app-loading-state *ngIf="loading()"></app-loading-state>
 <section class="grid" *ngIf="!loading()"><mat-card *ngFor="let r of cards"><h2>{{r.title}}</h2><p>{{r.description}}</p><div class="summary" *ngIf="summaries[r.kind] as s"><div *ngFor="let e of entries(s)"><span>{{label(e[0])}}</span><b>{{display(e[1])}}</b></div></div><div class="actions"><button mat-stroked-button (click)="download(r.kind,'excel')">Excel</button><button mat-stroked-button (click)="download(r.kind,'pdf')">PDF</button></div></mat-card></section>
 `,
 styles:[`.exports{display:flex;gap:8px;flex-wrap:wrap}.filters{display:flex;gap:12px;align-items:center;margin-bottom:6px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.grid mat-card{padding:0;overflow:hidden}.grid h2{font:600 18px var(--font-display);margin:0;padding:17px 18px 2px}.grid mat-card>p{margin:0;padding:0 18px 12px;color:var(--ink-soft);font-size:12.5px}.summary{padding:5px 18px 12px}.summary>div{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}.summary b{font-family:var(--font-mono);font-weight:500}.actions{display:flex;gap:8px;padding:12px 18px 18px}.error{background:var(--rose-soft);color:var(--rose);padding:10px 12px;border-radius:4px;margin-bottom:12px;font-size:13px}@media(max-width:800px){.grid{grid-template-columns:1fr}}@media(max-width:600px){.filters{flex-wrap:wrap}.exports{display:none}}`]
})
export class ReportsComponent implements OnInit {
 private svc=inject(ReportsService);summaries:Record<string,any>={};loading=signal(false);error=signal('');fromDate='';toDate='';
 cards=[{kind:'contracts',title:'Contract statistics',description:'Status and category distribution.'},{kind:'obligations',title:'Obligation statistics',description:'Pending, completed, delayed and overdue work.'},{kind:'renewals',title:'Renewal statistics',description:'Renewal pipeline and expiry window.'},{kind:'compliance',title:'Compliance statistics',description:'Compliance and risk distribution.'}];
 ngOnInit(){this.load()}
 load(){
  if(this.fromDate&&this.toDate&&this.fromDate>this.toDate){this.error.set('From date must be before To date.');return}
  this.loading.set(true);this.error.set('');this.summaries={};
  forkJoin([
    this.svc.contractsSummary(this.fromDate,this.toDate),
    this.svc.obligationsSummary(this.fromDate,this.toDate),
    this.svc.renewalsSummary(30),
    this.svc.complianceSummary(this.fromDate,this.toDate)
  ]).subscribe({
    next:([contracts,obligations,renewals,compliance])=>{this.summaries={contracts,obligations,renewals,compliance};this.loading.set(false)},
    error:e=>{this.loading.set(false);this.error.set(apiErrorMessage(e,'Unable to load reports.'))}
  })
 }
 entries(o:any):[string,any][]{return o&&typeof o==='object'?Object.entries(o).filter(([,v])=>typeof v!=='object') : []}
 label(k:string){return k.replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase())}
 display(v:any){return typeof v==='number'?v.toLocaleString():String(v)}
 download(kind:string,fmt:'excel'|'pdf'){this.svc.export(kind,fmt).subscribe({next:blob=>{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`contractiq_${kind}_report.${fmt==='excel'?'xlsx':'pdf'}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)},error:e=>this.error.set(apiErrorMessage(e,'Unable to export report.'))})}
}

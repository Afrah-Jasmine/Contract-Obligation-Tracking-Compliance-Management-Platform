import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../services/reports.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.css'
})
export class ReportsPage implements OnInit {

  contractSummary: any = {
    total: 0,
    active: 0,
    expired: 0
  };

  obligationSummary: any = {
    total: 0,
    completed: 0,
    overdue: 0
  };

  renewalSummary: any = {
    upcoming: 0,
    in_progress: 0,
    renewed: 0
  };

  complianceSummary: any = {
    compliant: 0,
    pending: 0,
    non_compliant: 0,
    high_risk: 0
  };

  constructor(private reportsService: ReportsService) {
  console.log('🟢 CONSTRUCTOR');
}

  ngOnInit(): void {

    
  console.log("🔥 REPORTS PAGE ngOnInit CALLED")

    // CONTRACTS
    this.reportsService.getContractSummary().subscribe({
  next: (data) => {
  console.log("🔥 CONTRACT API RESPONSE:", data);
  console.log("🔥 BEFORE ASSIGN:", this.contractSummary);

  this.contractSummary = data;

  console.log("🔥 AFTER ASSIGN:", this.contractSummary);
  console.log("🔥 AFTER ASSIGN TOTAL:", this.contractSummary.total);
},

  error: (err) => {
    console.error('❌ CONTRACT ERROR:', err);
  }
});


    // OBLIGATIONS
    this.reportsService.getObligationSummary().subscribe({
     next: (data) => {
  console.log("🔥 OBLIGATION API RESPONSE:", data);

  this.obligationSummary = data;

  console.log("🔥 OBLIGATION TOTAL:", this.obligationSummary.total);
},

  error: (err) => {
    console.error('❌ OBLIGATION ERROR:', err);
  }
});


    // RENEWALS
    this.reportsService.getRenewalSummary().subscribe({
      next: (data) => {
  console.log("🔥 RENEWAL API RESPONSE:", data);

  this.renewalSummary = data;

  console.log("🔥 RENEWAL SUMMARY:", this.renewalSummary);
},

      error: (err) => {
        console.error('RENEWAL ERROR:', err);
      }
    });


    // COMPLIANCE
    this.reportsService.getComplianceSummary().subscribe({
      next: (data) => {
  console.log("🔥 COMPLIANCE API RESPONSE:", data);

  this.complianceSummary = data;

  console.log("🔥 COMPLIANCE SUMMARY:", this.complianceSummary);
},

      error: (err) => {
        console.error('COMPLIANCE ERROR:', err);
      }
    });

  }
}
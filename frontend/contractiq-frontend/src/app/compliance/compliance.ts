import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import {
  ComplianceService,
  ComplianceSummary,
  ComplianceRisk
} from '../services/compliance';


@Component({
  selector: 'app-compliance',
  standalone: true,

  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],

  templateUrl: './compliance.html',
  styleUrl: './compliance.less'
})


export class Compliance implements OnInit {

  // =====================================================
  // DATA
  // =====================================================

  summary: ComplianceSummary | null = null;

  riskData: ComplianceRisk[] = [];


  // =====================================================
  // STATE
  // =====================================================

  loading = true;

  errorMessage = '';

  isEmpty = false;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private complianceService: ComplianceService,
    private cdr: ChangeDetectorRef
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.loadComplianceData();

  }


  // =====================================================
  // LOAD COMPLIANCE DATA
  // =====================================================

  loadComplianceData(): void {

    this.loading = true;

    this.errorMessage = '';

    this.isEmpty = false;


    this.complianceService
      .getComplianceSummary()
      .subscribe({

        next: (data: ComplianceSummary) => {

          console.log(
            'Compliance summary from backend:',
            data
          );


          // =================================================
          // STORE EXACT BACKEND RESPONSE
          // =================================================
          // IMPORTANT:
          // No frontend calculation is done here.
          //
          // average_score comes directly from:
          // /reports/compliance/summary
          // =================================================

          this.summary = data;


          console.log(
            'Backend Compliance Score:',
            this.summary?.average_score
          );


          // =================================================
          // LOADING COMPLETE
          // =================================================

          this.loading = false;


          // =================================================
          // EMPTY CHECK
          // =================================================

          if (
            !data ||
            Number(data.total || 0) === 0
          ) {

            this.isEmpty = true;

          }


          // =================================================
          // UPDATE UI
          // =================================================

          this.cdr.detectChanges();


          // =================================================
          // LOAD RISK DATA
          // =================================================

          this.loadRiskData();

        },


        // ===================================================
        // ERROR
        // ===================================================

        error: (error: any) => {

          console.error(
            'Compliance summary error:',
            error
          );


          this.loading = false;


          // -----------------------------------------------
          // 401 - UNAUTHORIZED
          // -----------------------------------------------

          if (error?.status === 401) {

            this.errorMessage =
              'Your session has expired. Please login again.';

          }


          // -----------------------------------------------
          // 403 - FORBIDDEN
          // -----------------------------------------------

          else if (error?.status === 403) {

            this.errorMessage =
              'You are not authorized to view compliance data.';

          }


          // -----------------------------------------------
          // 0 - BACKEND NOT CONNECTED
          // -----------------------------------------------

          else if (error?.status === 0) {

            this.errorMessage =
              'Unable to connect to the backend server.';

          }


          // -----------------------------------------------
          // OTHER ERRORS
          // -----------------------------------------------

          else {

            this.errorMessage =
              'Failed to load compliance data. Please try again.';

          }


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD RISK DATA
  // =====================================================

  loadRiskData(): void {

    this.complianceService
      .getRiskReport()
      .subscribe({

        next: (data: ComplianceRisk[]) => {

          console.log(
            'Risk data:',
            data
          );


          this.riskData =
            data || [];


          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'Risk report error:',
            error
          );


          // Risk failure should NOT
          // remove compliance summary.

          this.riskData = [];


          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // SCORE CLASS
  // =====================================================

  getScoreClass(score: number): string {

    if (score >= 80) {

      return 'good';

    }


    if (score >= 50) {

      return 'medium';

    }


    return 'poor';

  }


  // =====================================================
  // SCORE DISPLAY
  // =====================================================

  getComplianceScore(): number {

    if (!this.summary) {

      return 0;

    }


    // ===================================================
    // IMPORTANT:
    // Return EXACT BACKEND average_score
    // ===================================================

    return Number(
      this.summary.average_score || 0
    );

  }


  // =====================================================
  // SCORE WIDTH
  // =====================================================

  getComplianceWidth(): string {

    const score =
      this.getComplianceScore();


    return `${Math.min(
      Math.max(score, 0),
      100
    )}%`;

  }


  // =====================================================
  // RISK CLASS
  // =====================================================

  getRiskClass(risk: string): string {

    switch (risk) {

      case 'High':

        return 'high';


      case 'Medium':

        return 'medium';


      case 'Low':

        return 'low';


      default:

        return 'default';

    }

  }


  // =====================================================
  // RETRY
  // =====================================================

  retry(): void {

    this.loadComplianceData();

  }

}
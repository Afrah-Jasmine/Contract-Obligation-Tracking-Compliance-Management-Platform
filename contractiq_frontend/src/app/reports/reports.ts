// import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// import { timeout, finalize } from 'rxjs';

// import { ApiService } from '../services/api';

// @Component({
//   selector: 'app-reports',
//   imports: [],
//   templateUrl: './reports.html',
//   styleUrl: './reports.css'
// })
// export class Reports implements OnInit {

//   contractStats: any = null;
//   obligationStats: any = null;
//   renewalStats: any = null;
//   complianceStats: any = null;
//   riskData: any[] = [];
//   departmentData: any[] = [];

//   loading = true;
//   errorMessage = '';

//   constructor(
//     private apiService: ApiService,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit(): void {
//     this.loadReports();
//   }

//   loadReports(): void {
//     this.loading = true;
//     this.errorMessage = '';

//     this.apiService.getContractStatistics()
//       .pipe(
//         timeout(10000),
//         finalize(() => {
//           this.loading = false;
//           this.cdr.detectChanges();
//         })
//       )
//       .subscribe({
//         next: (data) => {
//           console.log('CONTRACT REPORT:', data);
//           this.contractStats = data;
//         },
//         error: (error) => {
//           console.error('CONTRACT REPORT ERROR:', error);
//           this.handleError(error);
//         }
//       });

//     this.apiService.getObligationStatistics()
//       .subscribe({
//         next: (data) => {
//           console.log('OBLIGATION REPORT:', data);
//           this.obligationStats = data;
//           this.cdr.detectChanges();
//         },
//         error: (error) => {
//           console.error('OBLIGATION REPORT ERROR:', error);
//         }
//       });

//     this.apiService.getRenewalStatistics()
//       .subscribe({
//         next: (data) => {
//           console.log('RENEWAL REPORT:', data);
//           this.renewalStats = data;
//           this.cdr.detectChanges();
//         },
//         error: (error) => {
//           console.error('RENEWAL REPORT ERROR:', error);
//         }
//       });

//     this.apiService.getComplianceStatistics()
//       .subscribe({
//         next: (data) => {
//           console.log('COMPLIANCE REPORT:', data);
//           this.complianceStats = data;
//           this.cdr.detectChanges();
//         },
//         error: (error) => {
//           console.error('COMPLIANCE REPORT ERROR:', error);
//         }
//       });

//     this.apiService.getRiskSummary()
//       .subscribe({
//         next: (data) => {
//           console.log('RISK REPORT:', data);
//           this.riskData = Array.isArray(data) ? data : [];
//           this.cdr.detectChanges();
//         },
//         error: (error) => {
//           console.error('RISK REPORT ERROR:', error);
//         }
//       });

//     this.apiService.getDepartmentPerformance()
//       .subscribe({
//         next: (data) => {
//           console.log('DEPARTMENT REPORT:', data);
//           this.departmentData = Array.isArray(data) ? data : [];
//           this.cdr.detectChanges();
//         },
//         error: (error) => {
//           console.error('DEPARTMENT REPORT ERROR:', error);
//         }
//       });
//   }

//   handleError(error: any): void {
//     if (error.status === 401) {
//       this.errorMessage =
//         'You are not authorized to view reports.';
//     } else if (error.status === 403) {
//       this.errorMessage =
//         'You do not have permission to view reports.';
//     } else if (error.status === 0) {
//       this.errorMessage =
//         'Unable to connect to ContractIQ server.';
//     } else {
//       this.errorMessage =
//         'Unable to load reports. Please try again.';
//     }
//   }

//   downloadContractPdf(): void {
//     window.open(
//       'http://127.0.0.1:8080/reports/contracts/export/pdf',
//       '_blank'
//     );
//   }

//   downloadContractExcel(): void {
//     window.open(
//       'http://127.0.0.1:8080/reports/contracts/export/excel',
//       '_blank'
//     );
//   }
// }


import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { finalize, timeout } from 'rxjs';
import { ApiService } from '../services/api';


// ============================================================
// TYPES
// ============================================================

interface ContractStatistics {
  total_contracts: number;
  active_contracts: number;
  draft_contracts: number;
  under_review_contracts: number;
  approved_contracts: number;
  expired_contracts: number;
  terminated_contracts: number;
}

interface ObligationStatistics {
  total_obligations: number;
  completed_obligations: number;
  pending_obligations: number;
  overdue_obligations: number;
  delayed_obligations: number;
  completion_rate: number;
}

interface RenewalStatistics {
  total_renewals: number;
  upcoming_renewals: number;
  in_progress_renewals: number;
  renewed_renewals: number;
  expired_renewals: number;
  cancelled_renewals: number;
}

interface ComplianceStatistics {
  total_contracts: number;
  compliant_contracts: number;
  pending_contracts: number;
  delayed_contracts: number;
  non_compliant_contracts: number;
  high_risk_contracts: number;
  average_compliance_score: number;
}

interface RiskSummary {
  low_risk_contracts: number;
  medium_risk_contracts: number;
  high_risk_contracts: number;
  total_risk_contracts: number;
}

interface UpcomingRenewal {
  id: number;
  contract_id: number;
  assigned_to: number | null;
  renewal_date: string;
  notice_days: number;
  status: string;
  new_expiry_date: string | null;
  previous_expiry_date: string | null;
  notes: string | null;
}

interface OverdueObligation {
  id: number;
  contract_id: number;
  assigned_to: number | null;
  title: string;
  obligation_type: string;
  due_date: string;
  status: string;
  priority: string | null;
}

interface DepartmentPerformance {
  department: string;
  total_contracts: number;
  total_obligations: number;
  completed_obligations: number;
  overdue_obligations: number;
  compliance_score: number;
}


// ============================================================
// COMPONENT
// ============================================================

@Component({
  selector: 'app-reports',
  imports: [],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {

  // ============================================================
  // REPORT DATA
  // ============================================================

  contractStats: ContractStatistics | null = null;

  obligationStats: ObligationStatistics | null = null;

  renewalStats: RenewalStatistics | null = null;

  complianceStats: ComplianceStatistics | null = null;

  riskSummary: RiskSummary | null = null;

  upcomingRenewals: UpcomingRenewal[] = [];

  overdueObligations: OverdueObligation[] = [];

  departmentData: DepartmentPerformance[] = [];


  // ============================================================
  // PAGE STATE
  // ============================================================

  loading = true;

  errorMessage = '';

  exporting = '';


  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  ngOnInit(): void {
    this.loadReports();
  }


  // ============================================================
  // LOAD ALL REPORTS
  // ============================================================

  loadReports(): void {

    this.loading = true;

    this.errorMessage = '';

    this.contractStats = null;
    this.obligationStats = null;
    this.renewalStats = null;
    this.complianceStats = null;
    this.riskSummary = null;

    this.upcomingRenewals = [];

    this.overdueObligations = [];

    this.departmentData = [];


    // ----------------------------------------------------------
    // CONTRACT STATISTICS
    // ----------------------------------------------------------

    this.apiService
      .getContractStatistics()
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {

          console.log('CONTRACT REPORT:', data);

          this.contractStats = data;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'CONTRACT REPORT ERROR:',
            error
          );

          this.handleError(error);
        }
      });


    // ----------------------------------------------------------
    // OBLIGATION STATISTICS
    // ----------------------------------------------------------

    this.apiService
      .getObligationStatistics()
      .subscribe({

        next: (data) => {

          console.log(
            'OBLIGATION REPORT:',
            data
          );

          this.obligationStats = data;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'OBLIGATION REPORT ERROR:',
            error
          );
        }

      });


    // ----------------------------------------------------------
    // RENEWAL STATISTICS
    // ----------------------------------------------------------

    this.apiService
      .getRenewalStatistics()
      .subscribe({

        next: (data) => {

          console.log(
            'RENEWAL REPORT:',
            data
          );

          this.renewalStats = data;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'RENEWAL REPORT ERROR:',
            error
          );
        }

      });


    // ----------------------------------------------------------
    // COMPLIANCE STATISTICS
    // ----------------------------------------------------------

    this.apiService
      .getComplianceStatistics()
      .subscribe({

        next: (data) => {

          console.log(
            'COMPLIANCE REPORT:',
            data
          );

          this.complianceStats = data;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'COMPLIANCE REPORT ERROR:',
            error
          );
        }

      });


    // ----------------------------------------------------------
    // RISK SUMMARY
    // ----------------------------------------------------------

    this.apiService
      .getRiskSummary()
      .subscribe({

        next: (data) => {

          console.log(
            'RISK REPORT:',
            data
          );

          /*
           * /reports/risk returns an OBJECT,
           * not an array.
           */
          this.riskSummary = data;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'RISK REPORT ERROR:',
            error
          );
        }

      });


    // ----------------------------------------------------------
    // UPCOMING RENEWALS
    // ----------------------------------------------------------

    this.apiService
      .getUpcomingRenewals()
      .subscribe({

        next: (data) => {

          console.log(
            'UPCOMING RENEWALS:',
            data
          );

          /*
           * Backend response:
           *
           * {
           *   days: 30,
           *   count: 0,
           *   renewals: []
           * }
           */
          this.upcomingRenewals =
            Array.isArray(data?.renewals)
              ? data.renewals
              : [];

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'UPCOMING RENEWALS ERROR:',
            error
          );
        }

      });


    // ----------------------------------------------------------
    // OVERDUE OBLIGATIONS
    // ----------------------------------------------------------

    this.apiService
      .getOverdueObligations()
      .subscribe({

        next: (data) => {

          console.log(
            'OVERDUE OBLIGATIONS:',
            data
          );

          /*
           * Backend response:
           *
           * {
           *   count: 0,
           *   obligations: []
           * }
           */
          this.overdueObligations =
            Array.isArray(data?.obligations)
              ? data.obligations
              : [];

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'OVERDUE OBLIGATIONS ERROR:',
            error
          );
        }

      });


    // ----------------------------------------------------------
    // DEPARTMENT PERFORMANCE
    // ----------------------------------------------------------

    this.apiService
      .getDepartmentPerformance()
      .subscribe({

        next: (data) => {

          console.log(
            'DEPARTMENT REPORT:',
            data
          );

          this.departmentData =
            Array.isArray(data)
              ? data
              : [];

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'DEPARTMENT REPORT ERROR:',
            error
          );
        }

      });

  }


  // ============================================================
  // ERROR HANDLING
  // ============================================================

  handleError(error: any): void {

    if (error.status === 401) {

      this.errorMessage =
        'You are not authorized to view reports. Please login again.';

      return;
    }


    if (error.status === 403) {

      this.errorMessage =
        'You do not have permission to view reports.';

      return;
    }


    if (error.status === 0) {

      this.errorMessage =
        'Unable to connect to ContractIQ server. Please make sure the backend is running.';

      return;
    }


    if (error.name === 'TimeoutError') {

      this.errorMessage =
        'The report request timed out. Please try again.';

      return;
    }


    this.errorMessage =
      'Unable to load reports. Please try again.';
  }


  // ============================================================
  // PDF / EXCEL DOWNLOAD HELPER
  // ============================================================

  private downloadFile(
    blob: Blob,
    filename: string
  ): void {

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  }


  // ============================================================
  // CONTRACT PDF
  // ============================================================

  downloadContractPdf(): void {

    this.exporting = 'contract-pdf';

    this.errorMessage = '';

    this.apiService
      .exportContractsPdf()
      .pipe(
        timeout(30000),
        finalize(() => {
          this.exporting = '';
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (blob) => {

          this.downloadFile(
            blob,
            'contract_report.pdf'
          );
        },

        error: (error) => {

          console.error(
            'CONTRACT PDF EXPORT ERROR:',
            error
          );

          this.handleExportError(error);
        }

      });
  }


  // ============================================================
  // CONTRACT EXCEL
  // ============================================================

  downloadContractExcel(): void {

    this.exporting = 'contract-excel';

    this.errorMessage = '';

    this.apiService
      .exportContractsExcel()
      .pipe(
        timeout(30000),
        finalize(() => {
          this.exporting = '';
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (blob) => {

          this.downloadFile(
            blob,
            'contract_report.xlsx'
          );
        },

        error: (error) => {

          console.error(
            'CONTRACT EXCEL EXPORT ERROR:',
            error
          );

          this.handleExportError(error);
        }

      });
  }


  // ============================================================
  // OBLIGATION PDF
  // ============================================================

  downloadObligationPdf(): void {

    this.exporting = 'obligation-pdf';

    this.errorMessage = '';

    this.apiService
      .exportObligationsPdf()
      .pipe(
        timeout(30000),
        finalize(() => {
          this.exporting = '';
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (blob) => {

          this.downloadFile(
            blob,
            'obligation_report.pdf'
          );
        },

        error: (error) => {

          console.error(
            'OBLIGATION PDF EXPORT ERROR:',
            error
          );

          this.handleExportError(error);
        }

      });
  }


  // ============================================================
  // OBLIGATION EXCEL
  // ============================================================

  downloadObligationExcel(): void {

    this.exporting = 'obligation-excel';

    this.errorMessage = '';

    this.apiService
      .exportObligationsExcel()
      .pipe(
        timeout(30000),
        finalize(() => {
          this.exporting = '';
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (blob) => {

          this.downloadFile(
            blob,
            'obligation_report.xlsx'
          );
        },

        error: (error) => {

          console.error(
            'OBLIGATION EXCEL EXPORT ERROR:',
            error
          );

          this.handleExportError(error);
        }

      });
  }


  // ============================================================
  // RENEWAL PDF
  // ============================================================

  downloadRenewalPdf(): void {

    this.exporting = 'renewal-pdf';

    this.errorMessage = '';

    this.apiService
      .exportRenewalsPdf()
      .pipe(
        timeout(30000),
        finalize(() => {
          this.exporting = '';
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (blob) => {

          this.downloadFile(
            blob,
            'renewal_report.pdf'
          );
        },

        error: (error) => {

          console.error(
            'RENEWAL PDF EXPORT ERROR:',
            error
          );

          this.handleExportError(error);
        }

      });
  }


  // ============================================================
  // RENEWAL EXCEL
  // ============================================================

  downloadRenewalExcel(): void {

    this.exporting = 'renewal-excel';

    this.errorMessage = '';

    this.apiService
      .exportRenewalsExcel()
      .pipe(
        timeout(30000),
        finalize(() => {
          this.exporting = '';
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (blob) => {

          this.downloadFile(
            blob,
            'renewal_report.xlsx'
          );
        },

        error: (error) => {

          console.error(
            'RENEWAL EXCEL EXPORT ERROR:',
            error
          );

          this.handleExportError(error);
        }

      });
  }


  // ============================================================
  // COMPLIANCE PDF
  // ============================================================

  downloadCompliancePdf(): void {

    this.exporting = 'compliance-pdf';

    this.errorMessage = '';

    this.apiService
      .exportCompliancePdf()
      .pipe(
        timeout(30000),
        finalize(() => {
          this.exporting = '';
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (blob) => {

          this.downloadFile(
            blob,
            'compliance_report.pdf'
          );
        },

        error: (error) => {

          console.error(
            'COMPLIANCE PDF EXPORT ERROR:',
            error
          );

          this.handleExportError(error);
        }

      });
  }


  // ============================================================
  // COMPLIANCE EXCEL
  // ============================================================

  downloadComplianceExcel(): void {

    this.exporting = 'compliance-excel';

    this.errorMessage = '';

    this.apiService
      .exportComplianceExcel()
      .pipe(
        timeout(30000),
        finalize(() => {
          this.exporting = '';
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (blob) => {

          this.downloadFile(
            blob,
            'compliance_report.xlsx'
          );
        },

        error: (error) => {

          console.error(
            'COMPLIANCE EXCEL EXPORT ERROR:',
            error
          );

          this.handleExportError(error);
        }

      });
  }


  // ============================================================
  // EXPORT ERROR HANDLING
  // ============================================================

  private handleExportError(error: any): void {

    if (error.status === 401) {

      this.errorMessage =
        'You are not authenticated. Please login again.';

      return;
    }


    if (error.status === 403) {

      this.errorMessage =
        'You do not have permission to generate this report.';

      return;
    }


    if (error.status === 0) {

      this.errorMessage =
        'Unable to connect to ContractIQ server.';

      return;
    }


    if (error.name === 'TimeoutError') {

      this.errorMessage =
        'Report generation timed out. Please try again.';

      return;
    }


    this.errorMessage =
      'Unable to generate the report. Please try again.';
  }


  // ============================================================
  // EXPORTING STATE HELPERS
  // ============================================================

  isExporting(type: string): boolean {

    return this.exporting === type;
  }

}
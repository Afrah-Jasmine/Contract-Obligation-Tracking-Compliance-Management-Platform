import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService } from '../services/api';

Chart.register(...registerables);


// ======================================================
// TYPES
// ======================================================

interface DashboardSummary {
  total_contracts: number;
  active_contracts: number;
  total_obligations: number;
  pending_obligations: number;
  overdue_obligations: number;
  upcoming_renewals: number;
  high_risk_contracts: number;
  compliance_score: number;
}

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

interface RiskSummary {
  low_risk_contracts: number;
  medium_risk_contracts: number;
  high_risk_contracts: number;
  total_risk_contracts: number;
}

interface Renewal {
  id: number;
  contract_id: number;
  renewal_date: string;
  notice_days: number;
  status: string;
}

interface Obligation {
  id: number;
  contract_id: number;
  title: string;
  due_date: string;
  status: string;
}


// ======================================================
// COMPONENT
// ======================================================

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements AfterViewInit, OnDestroy {

  // ====================================================
  // CHART REFERENCES
  // ====================================================

  @ViewChild('complianceChart')
  complianceChart?: ElementRef<HTMLCanvasElement>;

  @ViewChild('trendChart')
  trendChart?: ElementRef<HTMLCanvasElement>;

  @ViewChild('statusChart')
  statusChart?: ElementRef<HTMLCanvasElement>;


  // ====================================================
  // DASHBOARD VALUES
  // ====================================================

  totalContracts = 0;
  activeContracts = 0;
  expiredContracts = 0;

  totalObligations = 0;
  pendingObligations = 0;
  completedObligations = 0;
  overdueObligations = 0;
  delayedObligations = 0;

  upcomingRenewals = 0;

  highRiskContracts = 0;
  mediumRiskContracts = 0;
  lowRiskContracts = 0;

  complianceScore = 0;

  draftContracts = 0;
  underReviewContracts = 0;
  approvedContracts = 0;
  terminatedContracts = 0;


  // ====================================================
  // SYSTEM STATE
  // ====================================================

  systemStatus = 'OPERATIONAL';

  loading = true;

  errorMessage = '';


  // ====================================================
  // LISTS
  // ====================================================

  upcomingRenewalList: Renewal[] = [];

  overdueObligationList: Obligation[] = [];


  // ====================================================
  // CHART INSTANCES
  // ====================================================

  private complianceChartInstance?: Chart;

  private trendChartInstance?: Chart;

  private statusChartInstance?: Chart;


  // ====================================================
  // CONSTRUCTOR
  // ====================================================

  constructor(
    private api: ApiService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}


  // ====================================================
  // INITIAL LOAD
  // ====================================================

  ngAfterViewInit(): void {
    this.loadDashboard();
  }


  // ====================================================
  // LOAD DASHBOARD
  // ====================================================

  loadDashboard(): void {

    this.loading = true;
    this.errorMessage = '';

    this.api.getDashboardSummary().subscribe({

      next: (data: DashboardSummary) => {

        this.totalContracts =
          data.total_contracts;

        this.activeContracts =
          data.active_contracts;

        this.totalObligations =
          data.total_obligations;

        this.pendingObligations =
          data.pending_obligations;

        this.overdueObligations =
          data.overdue_obligations;

        this.upcomingRenewals =
          data.upcoming_renewals;

        this.highRiskContracts =
          data.high_risk_contracts;

        this.complianceScore =
          data.compliance_score;

        this.loadAdditionalAnalytics();
      },

      error: (error: HttpErrorResponse) => {

        console.error(
          'Dashboard summary error:',
          error
        );

        this.loading = false;

        this.errorMessage =
          'Unable to load ContractIQ analytics. Please check the backend server.';
      }
    });
  }


  // ====================================================
  // ADDITIONAL ANALYTICS
  // ====================================================

  private loadAdditionalAnalytics(): void {

    forkJoin({

      contracts:
        this.api.getContractStatistics().pipe(
          catchError((error) => {

            console.error(
              'Contract statistics error:',
              error
            );

            return of(null);
          })
        ),

      obligations:
        this.api.getObligationStatistics().pipe(
          catchError((error) => {

            console.error(
              'Obligation statistics error:',
              error
            );

            return of(null);
          })
        ),

      risk:
        this.api.getRiskSummary().pipe(
          catchError((error) => {

            console.error(
              'Risk summary error:',
              error
            );

            return of(null);
          })
        ),

      renewals:
        this.api.getUpcomingRenewals().pipe(
          catchError((error) => {

            console.error(
              'Upcoming renewals error:',
              error
            );

            return of([]);
          })
        ),

      overdue:
        this.api.getOverdueObligations().pipe(
          catchError((error) => {

            console.error(
              'Overdue obligations error:',
              error
            );

            return of([]);
          })
        )

    }).subscribe({

      next: (result) => {

        // ----------------------------------------------
        // CONTRACT DATA
        // ----------------------------------------------

        if (result.contracts) {

          const data =
            result.contracts as ContractStatistics;

          this.draftContracts =
            data.draft_contracts;

          this.underReviewContracts =
            data.under_review_contracts;

          this.approvedContracts =
            data.approved_contracts;

          this.activeContracts =
            data.active_contracts;

          this.expiredContracts =
            data.expired_contracts;

          this.terminatedContracts =
            data.terminated_contracts;
        }


        // ----------------------------------------------
        // OBLIGATION DATA
        // ----------------------------------------------

        if (result.obligations) {

          const data =
            result.obligations as ObligationStatistics;

          this.totalObligations =
            data.total_obligations;

          this.completedObligations =
            data.completed_obligations;

          this.pendingObligations =
            data.pending_obligations;

          this.overdueObligations =
            data.overdue_obligations;

          this.delayedObligations =
            data.delayed_obligations;
        }


        // ----------------------------------------------
        // RISK DATA
        // ----------------------------------------------

        if (result.risk) {

          const data =
            result.risk as RiskSummary;

          this.lowRiskContracts =
            data.low_risk_contracts;

          this.mediumRiskContracts =
            data.medium_risk_contracts;

          this.highRiskContracts =
            data.high_risk_contracts;
        }


        // ----------------------------------------------
        // RENEWAL DATA
        // ----------------------------------------------

        this.upcomingRenewalList =
          Array.isArray(result.renewals)
            ? result.renewals as Renewal[]
            : [];


        // ----------------------------------------------
        // OVERDUE DATA
        // ----------------------------------------------

        this.overdueObligationList =
          Array.isArray(result.overdue)
            ? result.overdue as Obligation[]
            : [];


        // ----------------------------------------------
        // STOP LOADING
        // ----------------------------------------------

        this.loading = false;


        // ----------------------------------------------
        // FORCE ANGULAR TO RENDER CANVASES
        // ----------------------------------------------

        this.changeDetectorRef.detectChanges();


        // ----------------------------------------------
        // CREATE CHARTS AFTER RENDER
        // ----------------------------------------------

        requestAnimationFrame(() => {

          this.createCharts();

        });
      },

      error: (error: HttpErrorResponse) => {

        console.error(
          'Dashboard analytics error:',
          error
        );

        this.loading = false;

        this.errorMessage =
          'Some dashboard analytics could not be loaded.';
      }
    });
  }


  // ====================================================
  // CREATE ALL CHARTS
  // ====================================================

  private createCharts(): void {

    console.log(
      'Creating dashboard charts...'
    );

    console.log(
      'Compliance canvas:',
      this.complianceChart
    );

    console.log(
      'Trend canvas:',
      this.trendChart
    );

    console.log(
      'Status canvas:',
      this.statusChart
    );

    this.createComplianceChart();

    this.createTrendChart();

    this.createStatusChart();
  }


  // ====================================================
  // COMPLIANCE DONUT
  // ====================================================

  private createComplianceChart(): void {

    if (!this.complianceChart?.nativeElement) {

      console.warn(
        'Compliance chart canvas is not available.'
      );

      return;
    }

    this.complianceChartInstance?.destroy();

    const score =
      Math.min(
        Math.max(this.complianceScore, 0),
        100
      );


    this.complianceChartInstance =
      new Chart(
        this.complianceChart.nativeElement,
        {
          type: 'doughnut',

          data: {

            labels: [
              'Compliant',
              'Remaining'
            ],

            datasets: [

              {
                data: [
                  score,
                  100 - score
                ],

                backgroundColor: [
                  '#14b8a6',
                  '#e8eef5'
                ],

                borderWidth: 0
              }

            ]
          },

          options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: '76%',

            plugins: {

              legend: {
                display: false
              },

              tooltip: {
                enabled: true
              }
            }
          }
        }
      );
  }


  // ====================================================
  // CURRENT COMPLIANCE SCORE
  // ====================================================

  private createTrendChart(): void {

    if (!this.trendChart?.nativeElement) {

      console.warn(
        'Trend chart canvas is not available.'
      );

      return;
    }

    this.trendChartInstance?.destroy();

    const score =
      Math.min(
        Math.max(this.complianceScore, 0),
        100
      );


    this.trendChartInstance =
      new Chart(
        this.trendChart.nativeElement,
        {
          type: 'bar',

          data: {

            labels: [
              'Current Compliance'
            ],

            datasets: [

              {
                label: 'Compliance Score',

                data: [
                  score
                ],

                backgroundColor: [
                  '#2563eb'
                ],

                borderRadius: 8,

                borderSkipped: false
              }

            ]
          },

          options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

              legend: {
                display: false
              },

              tooltip: {

                enabled: true,

                callbacks: {

                  label: (context) =>
                    `${context.parsed.y}%`
                }
              }
            },

            scales: {

              y: {

                beginAtZero: true,

                max: 100,

                ticks: {

                  callback: (
                    value: string | number
                  ) => `${value}%`
                },

                grid: {
                  color: '#edf1f5'
                }
              },

              x: {

                grid: {
                  display: false
                }
              }
            }
          }
        }
      );
  }


  // ====================================================
  // CONTRACT STATUS CHART
  // ====================================================

  private createStatusChart(): void {

    if (!this.statusChart?.nativeElement) {

      console.warn(
        'Status chart canvas is not available.'
      );

      return;
    }

    this.statusChartInstance?.destroy();


    this.statusChartInstance =
      new Chart(
        this.statusChart.nativeElement,
        {
          type: 'bar',

          data: {

            labels: [
              'Draft',
              'Review',
              'Approved',
              'Active',
              'Expired',
              'Terminated'
            ],

            datasets: [

              {
                label: 'Contracts',

                data: [

                  this.draftContracts,

                  this.underReviewContracts,

                  this.approvedContracts,

                  this.activeContracts,

                  this.expiredContracts,

                  this.terminatedContracts

                ],

                backgroundColor: [
                  '#94a3b8',
                  '#60a5fa',
                  '#14b8a6',
                  '#2563eb',
                  '#f59e0b',
                  '#ef4444'
                ],

                borderRadius: 8,

                borderSkipped: false
              }

            ]
          },

          options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

              legend: {
                display: false
              },

              tooltip: {
                enabled: true
              }
            },

            scales: {

              y: {

                beginAtZero: true,

                ticks: {
                  precision: 0
                },

                grid: {
                  color: '#edf1f5'
                }
              },

              x: {

                grid: {
                  display: false
                }
              }
            }
          }
        }
      );
  }


  // ====================================================
  // ALERT MESSAGE
  // ====================================================

  get alertMessage(): string {

    if (this.highRiskContracts > 0) {

      return 'Critical contract risks require immediate attention.';
    }

    if (this.overdueObligations > 0) {

      const count =
        this.overdueObligations;

      return count === 1
        ? '1 obligation has crossed its deadline.'
        : `${count} obligations have crossed their deadlines.`;
    }

    if (this.pendingObligations > 0) {

      const count =
        this.pendingObligations;

      return count === 1
        ? '1 obligation is still pending.'
        : `${count} obligations are still pending.`;
    }

    return 'No critical contract risks detected.';
  }


  // ====================================================
  // ALERT LEVEL
  // ====================================================

  get alertLevel(): string {

    if (this.highRiskContracts > 0) {
      return 'critical';
    }

    if (
      this.overdueObligations > 0 ||
      this.pendingObligations > 0
    ) {
      return 'warning';
    }

    return 'safe';
  }


  // ====================================================
  // HEALTHY CONTRACTS
  // ====================================================

  get healthyContracts(): number {

    return Math.max(

      this.totalContracts
      - this.mediumRiskContracts
      - this.highRiskContracts,

      0
    );
  }


  // ====================================================
  // CLEANUP
  // ====================================================

  ngOnDestroy(): void {

    this.complianceChartInstance?.destroy();

    this.trendChartInstance?.destroy();

    this.statusChartInstance?.destroy();
  }

}
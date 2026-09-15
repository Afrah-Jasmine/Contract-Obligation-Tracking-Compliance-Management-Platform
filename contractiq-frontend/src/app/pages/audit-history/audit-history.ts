import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { ContractService } from '../../core/services/contract.service';
import { ObligationService } from '../../core/services/obligation.service';

export interface AuditLog {
  id: string;
  action: string;
  module: 'Contracts' | 'Obligations' | 'Renewals' | 'Compliance' | 'User Session';
  user: string;
  details: string;
  timestamp: Date;
  status: 'SUCCESS' | 'WARNING' | 'INFO';
}

@Component({
  selector: 'app-audit-history',
  imports: [CommonModule],
  templateUrl: './audit-history.html',
  styleUrl: './audit-history.css'
})
export class AuditHistory implements OnInit {

  auditLogs = signal<AuditLog[]>([]);
  loading = signal<boolean>(true);

  constructor(
    public authService: AuthService,
    private contractService: ContractService,
    private obligationService: ObligationService
  ) {}

  ngOnInit(): void {
    this.generateAuditLogs();
  }

  generateAuditLogs(): void {
    this.loading.set(true);

    const currentUser = this.authService.currentUser()?.full_name || 'System User';
    
    // Fetch live contracts and obligations to synthesize actual audit history
    this.contractService.getContracts().subscribe({
      next: (contracts) => {
        const logs: AuditLog[] = [];

        contracts.forEach((c, idx) => {
          logs.push({
            id: `LOG-${1000 + idx * 2}`,
            action: `Contract Created (${c.status})`,
            module: 'Contracts',
            user: currentUser,
            details: `Created contract '${c.title}' with contract ID #${c.id} (${c.contract_number}).`,
            timestamp: c.created_at ? new Date(c.created_at) : new Date(Date.now() - (idx + 1) * 3600000 * 24),
            status: 'INFO'
          });

          if (c.updated_at) {
            logs.push({
              id: `LOG-${1001 + idx * 2}`,
              action: `Contract Status Update`,
              module: 'Contracts',
              user: currentUser,
              details: `Contract #${c.id} transitioned to '${c.status}' state.`,
              timestamp: new Date(c.updated_at),
              status: c.status === 'Active' ? 'SUCCESS' : 'INFO'
            });
          }
        });

        // Add default authentication session event
        logs.unshift({
          id: 'LOG-SESSION',
          action: 'User Authentication Successful',
          module: 'User Session',
          user: currentUser,
          details: `Authenticated user session granted for ${currentUser}.`,
          timestamp: new Date(),
          status: 'SUCCESS'
        });

        // Sort descending by timestamp
        logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        this.auditLogs.set(logs);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="status-chip" [ngClass]="tone">{{ status }}</span>`,
  styles: [`
    .status-chip {
      display:inline-flex; align-items:center; padding:4px 10px; border-radius:999px;
      font-size:12px; font-weight:600; white-space:nowrap; background:#eef0f2; color:#52606d;
    }
    .good { background:#e4eeea; color:#2f6f5e; }
    .warn { background:#f4ead4; color:#a9761f; }
    .bad { background:#f5e4e1; color:#a63c33; }
    .info { background:#e7edf5; color:#34516f; }
  `]
})
export class StatusChipComponent {
  @Input() status = '';
  get tone(): string {
    if (['Active','Approved','Completed','Renewed','Compliant','Low','Read'].includes(this.status)) return 'good';
    if (['Draft','Under Review','Pending','In Progress','Delayed','Upcoming','Medium'].includes(this.status)) return 'warn';
    if (['Expired','Terminated','Overdue','Non-Compliant','High Risk','High','Cancelled','Unread'].includes(this.status)) return 'bad';
    return 'info';
  }
}

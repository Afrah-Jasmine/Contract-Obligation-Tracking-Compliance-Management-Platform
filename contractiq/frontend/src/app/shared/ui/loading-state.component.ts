import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `<div class="loading"><mat-spinner diameter="32"></mat-spinner><span>{{ message }}</span></div>`,
  styles: [`.loading{min-height:180px;display:flex;align-items:center;justify-content:center;gap:14px;color:#5b6b7d}`]
})
export class LoadingStateComponent { @Input() message = 'Loading…'; }

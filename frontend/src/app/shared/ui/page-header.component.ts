import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="head">
      <div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:20px}
    h1{margin:0;font-family:var(--font-display);font-size:28px;font-weight:650}
    p{margin:4px 0 0;color:var(--ink-soft);font-size:14px}
    @media(max-width:650px){.head{align-items:flex-start;flex-direction:column}}
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-renewals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './renewals.html',
  styleUrl: './renewals.css'
})
export class Renewals implements OnInit {

  renewals: any[] = [];
  loading = true;
  error = '';

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRenewals();
  }

  loadRenewals(): void {
    this.loading = true;
    this.error = '';

    this.api.getRenewals().subscribe({
      next: (data: any) => {

        console.log('Renewals received:', data);

        this.renewals = [...data];

        this.loading = false;

        this.cdr.detectChanges();

        console.log('Number of renewals:', this.renewals.length);
        console.log('Loading:', this.loading);
      },

      error: (err) => {

        console.error('Renewals API error:', err);

        this.error = err?.error?.detail || 'Unable to load renewals.';
        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }
}
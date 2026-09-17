import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-obligations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './obligations.html',
  styleUrl: './obligations.css'
})
export class Obligations implements OnInit {

  obligations: any[] = [];
  loading = true;
  error = '';

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadObligations();
  }

  loadObligations(): void {

    this.loading = true;
    this.error = '';

    this.api.getObligations().subscribe({
      next: (data: any) => {

        console.log('Obligations received:', data);

        this.obligations = [...data];

        this.loading = false;

        this.cdr.detectChanges();

        console.log('Number of obligations:', this.obligations.length);
        console.log('Loading:', this.loading);
      },

      error: (err) => {

        console.error('Obligations API error:', err);

        this.error = 'Unable to load obligations.';
        this.loading = false;

        this.cdr.detectChanges();
      }
    });
  }
}
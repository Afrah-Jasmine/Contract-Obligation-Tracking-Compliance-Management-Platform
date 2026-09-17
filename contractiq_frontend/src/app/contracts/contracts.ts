import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contracts.html',
  styleUrl: './contracts.css'
})
export class Contracts implements OnInit {

  contracts = signal<any[]>([]);
  loading = signal(true);
  error = signal('');

  selectedContract = signal<any>(null);

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {

    this.loading.set(true);
    this.error.set('');

    this.api.getContracts().subscribe({

      next: (response: any) => {

        console.log('Contracts received:', response);

        this.contracts.set(response || []);
        this.loading.set(false);

        console.log('Contracts count:', this.contracts().length);

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.error('Contracts API error:', err);

        this.loading.set(false);
        this.error.set(
          err?.error?.detail || 'Unable to load contracts.'
        );

        this.cdr.detectChanges();
      }

    });
  }

  viewContract(contract: any): void {
    this.selectedContract.set(contract);
  }

  closeDetails(): void {
    this.selectedContract.set(null);
  }

  submitReview(id: number): void {

    this.api.submitForReview(id).subscribe({

      next: () => {
        alert('Contract submitted for review.');
        this.loadContracts();
      },

      error: (err) => {
        alert(
          err?.error?.detail ||
          'Unable to submit contract for review.'
        );
      }

    });
  }

  approve(id: number): void {

    this.api.approveContract(id).subscribe({

      next: () => {
        alert('Contract approved.');
        this.loadContracts();
      },

      error: (err) => {
        alert(
          err?.error?.detail ||
          'Unable to approve contract.'
        );
      }

    });
  }

  activate(id: number): void {

    this.api.activateContract(id).subscribe({

      next: () => {
        alert('Contract activated.');
        this.loadContracts();
      },

      error: (err) => {
        alert(
          err?.error?.detail ||
          'Unable to activate contract.'
        );
      }

    });
  }
}
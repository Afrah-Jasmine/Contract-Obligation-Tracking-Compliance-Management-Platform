import { Component, OnInit } from '@angular/core';
import { ContractsService, Contract } from '../services/contracts';

@Component({
  selector: 'app-contracts',
  imports: [],
  templateUrl: './contracts.html',
  styleUrl: './contracts.css'
})
export class Contracts implements OnInit {

  contracts: Contract[] = [];

  loading = false;
  errorMessage = '';

  constructor(
    private contractsService: ContractsService
  ) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.contractsService.getContracts().subscribe({
      next: (data) => {
        this.contracts = Array.isArray(data) ? data : [];
        this.loading = false;
      },

      error: (error) => {
        console.error('Error loading contracts:', error);

        this.loading = false;

        if (error.status === 401) {
          this.errorMessage =
            'You are not authorized to view contracts.';
        } else if (error.status === 403) {
          this.errorMessage =
            'You do not have permission to view contracts.';
        } else if (error.status === 0) {
          this.errorMessage =
            'Unable to connect to ContractIQ server.';
        } else {
          this.errorMessage =
            'Unable to load contracts. Please try again.';
        }
      }
    });
  }
}
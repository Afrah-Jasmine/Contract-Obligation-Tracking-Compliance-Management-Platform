import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    HeaderComponent,
    SidebarComponent
  ],
  template: `
    <div class="layout-container">
      <app-header (toggleSidebar)="sidenav.toggle()"></app-header>
      
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav">
          <app-sidebar></app-sidebar>
        </mat-sidenav>
        
        <mat-sidenav-content class="main-content">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
          
          <footer class="app-footer">
            <p>&copy; 2026 ContractIQ Platform. All rights reserved. | Compliance & Obligation Management System</p>
          </footer>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    .sidenav-container {
      flex: 1;
      background-color: #f8fafc;
    }
    .sidenav {
      border-right: 1px solid #e2e8f0;
    }
    .main-content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 100%;
      background-color: #f8fafc;
    }
    .content-wrapper {
      padding: 24px;
      flex: 1;
    }
    .app-footer {
      padding: 16px 24px;
      text-align: center;
      background-color: #ffffff;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 0.8125rem;
    }
  `]
})
export class MainLayoutComponent {}

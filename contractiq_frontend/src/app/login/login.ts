import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { timeout, finalize } from 'rxjs';

import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  loginForm;

  loading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.nonNullable.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]
    });
  }


  // ====================================================
  // LOGIN
  // ====================================================

  login(): void {

    this.errorMessage = '';

    // ----------------------------------------------
    // VALIDATE FORM
    // ----------------------------------------------

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;
    }


    // ----------------------------------------------
    // GET FORM VALUES
    // ----------------------------------------------

    const {
      email,
      password
    } = this.loginForm.getRawValue();


    // ----------------------------------------------
    // START LOADING
    // ----------------------------------------------

    this.loading = true;


    // ----------------------------------------------
    // CALL LOGIN API
    // ----------------------------------------------

    this.authService
      .login(email, password)
      .pipe(

        // Allow up to 60s for Render free-tier cold starts
        timeout(60000),

        // Always stop loading when request finishes
        finalize(() => {
          this.loading = false;
        })

      )
      .subscribe({

        // ------------------------------------------
        // LOGIN SUCCESS
        // ------------------------------------------

        next: () => {

          this.router.navigate([
            '/dashboard'
          ]);
        },


        // ------------------------------------------
        // LOGIN ERROR
        // ------------------------------------------

        error: (error) => {

          console.error(
            'Login error:',
            error
          );


          // ----------------------------------------
          // INVALID CREDENTIALS
          // ----------------------------------------

          if (error.status === 401) {

            this.errorMessage =
              'INVALID EMAIL OR PASSWORD.';

            return;
          }


          // ----------------------------------------
          // INACTIVE ACCOUNT
          // ----------------------------------------

          if (error.status === 403) {

            this.errorMessage =
              'USER ACCOUNT IS INACTIVE.';

            return;
          }


          // ----------------------------------------
          // SERVER / CONNECTION ERROR
          // ----------------------------------------

          if (error.status === 0) {

            this.errorMessage =
              'UNABLE TO CONNECT TO CONTRACTIQ SERVER.';

            return;
          }


          // ----------------------------------------
          // REQUEST TIMEOUT
          // ----------------------------------------

          if (error.name === 'TimeoutError') {

            this.errorMessage =
              'LOGIN REQUEST TIMED OUT. PLEASE CHECK THAT THE BACKEND SERVER IS RUNNING.';

            return;
          }


          // ----------------------------------------
          // OTHER SERVER ERROR
          // ----------------------------------------

          this.errorMessage =
            'UNABLE TO COMPLETE LOGIN. PLEASE TRY AGAIN.';
        }

      });
  }


  // ====================================================
  // FORM CONTROLS
  // ====================================================

  get email() {
    return this.loginForm.controls.email;
  }


  get password() {
    return this.loginForm.controls.password;
  }

}
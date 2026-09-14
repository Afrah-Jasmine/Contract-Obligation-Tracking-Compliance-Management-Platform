import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  UsersService,
  User,
  CreateUserRequest,
  UpdateUserRequest
} from '../services/users';


@Component({
  selector: 'app-users',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],

  templateUrl: './users.html',
  styleUrl: './users.css'
})


export class Users implements OnInit {

  // =========================
  // TABLE
  // =========================

  displayedColumns: string[] = [
    'id',
    'full_name',
    'email',
    'role',
    'status',
    'actions'
  ];


  users: User[] = [];


  // =========================
  // STATE
  // =========================

  loading = false;
  saving = false;


  // =========================
  // MESSAGES
  // =========================

  errorMessage = '';
  successMessage = '';


  // =========================
  // ADD / EDIT FORM
  // =========================

  showForm = false;

  editingUser: User | null = null;

  formTitle = 'Add New User';


  // =========================
  // PASSWORD FORM
  // =========================

  showPasswordForm = false;

  passwordUser: User | null = null;

  newPassword = '';


  // =========================
  // FORM
  // =========================

  userForm;


  constructor(
    private usersService: UsersService,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {

    this.userForm = this.formBuilder.nonNullable.group({

      full_name: [
        '',
        Validators.required
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      role: [
        'EMPLOYEE',
        Validators.required
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


  // =========================
  // INITIAL LOAD
  // =========================

  ngOnInit(): void {

    this.loadUsers();

  }


  // =========================
  // LOAD USERS
  // =========================

  loadUsers(): void {

    this.loading = true;

    this.errorMessage = '';

    this.usersService.getUsers().subscribe({

      next: (users) => {

        this.users = users.sort(
          (a, b) => a.id - b.id
        );

        this.loading = false;

      },

      error: (error) => {

        console.error(
          'Failed to load users:',
          error
        );

        this.loading = false;

        this.errorMessage =
          'Unable to load users.';

      }

    });

  }


  // =========================
  // ADD USER
  // =========================

  openAddForm(): void {

    this.editingUser = null;

    this.formTitle = 'Add New User';

    this.errorMessage = '';

    this.successMessage = '';


    this.userForm.reset({

      full_name: '',
      email: '',
      role: 'EMPLOYEE',
      password: ''

    });


    this.userForm.controls.password.setValidators([

      Validators.required,

      Validators.minLength(6)

    ]);


    this.userForm.controls.password.updateValueAndValidity();


    this.showForm = true;

  }


  // =========================
  // EDIT USER
  // =========================

  openEditForm(user: User): void {

    this.editingUser = user;

    this.formTitle = 'Edit User';

    this.errorMessage = '';

    this.successMessage = '';


    this.userForm.patchValue({

      full_name: user.full_name,

      email: user.email,

      role: user.role,

      password: ''

    });


    this.userForm.controls.password.clearValidators();

    this.userForm.controls.password.updateValueAndValidity();


    this.showForm = true;

  }


  // =========================
  // CANCEL FORM
  // =========================

  cancelForm(): void {

    this.showForm = false;

    this.editingUser = null;

    this.formTitle = 'Add New User';


    this.userForm.reset({

      full_name: '',
      email: '',
      role: 'EMPLOYEE',
      password: ''

    });


    this.userForm.controls.password.setValidators([

      Validators.required,

      Validators.minLength(6)

    ]);


    this.userForm.controls.password.updateValueAndValidity();


    this.errorMessage = '';

  }


  // =========================
  // SAVE USER
  // =========================

  saveUser(): void {

    this.errorMessage = '';

    this.successMessage = '';


    if (this.userForm.invalid) {

      this.userForm.markAllAsTouched();

      return;

    }


    this.saving = true;


    const formData =
      this.userForm.getRawValue();


    // =========================
    // EDIT EXISTING USER
    // =========================

    if (this.editingUser) {

      const updateData: UpdateUserRequest = {

        full_name: formData.full_name,

        email: formData.email,

        role: formData.role,

        password: formData.password,

        is_active:
          this.editingUser.is_active

      };


      if (!updateData.password) {

        this.saving = false;

        this.errorMessage =
          'Please enter a password when editing a user.';

        return;

      }


      this.usersService.updateUser(

        this.editingUser.id,

        updateData

      ).subscribe({

        next: () => {

          this.saving = false;

          this.showForm = false;

          this.editingUser = null;

          this.formTitle =
            'Add New User';


          this.successMessage =
            'User updated successfully.';


          this.loadUsers();


          this.changeDetectorRef.detectChanges();

        },


        error: (error) => {

          console.error(
            'Failed to update user:',
            error
          );

          this.saving = false;

          this.errorMessage =
            'Unable to update user.';

        }

      });


      return;

    }


    // =========================
    // CREATE NEW USER
    // =========================

    const createData: CreateUserRequest = {

      full_name: formData.full_name,

      email: formData.email,

      role: formData.role,

      password: formData.password

    };


    this.usersService.createUser(

      createData

    ).subscribe({

      next: () => {

        this.saving = false;

        this.showForm = false;


        this.successMessage =
          'User created successfully.';


        this.loadUsers();


        this.changeDetectorRef.detectChanges();

      },


      error: (error) => {

        console.error(
          'Failed to create user:',
          error
        );

        this.saving = false;


        if (error.status === 400) {

          this.errorMessage =
            'Unable to create user. The email may already exist.';

        } else {

          this.errorMessage =
            'Unable to create user.';

        }

      }

    });

  }


  // =========================
  // DELETE USER
  // =========================

  deleteUser(user: User): void {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${user.full_name}?`
      );


    if (!confirmed) {

      return;

    }


    this.errorMessage = '';

    this.successMessage = '';


    this.usersService.deleteUser(

      user.id

    ).subscribe({

      next: () => {

        this.successMessage =
          'User deleted successfully.';


        this.loadUsers();


        this.changeDetectorRef.detectChanges();

      },


      error: (error) => {

        console.error(
          'Failed to delete user:',
          error
        );

        this.errorMessage =
          'Unable to delete user.';

      }

    });

  }


  // =========================
  // OPEN PASSWORD FORM
  // =========================

  openPasswordForm(user: User): void {

    this.passwordUser = user;

    this.newPassword = '';

    this.errorMessage = '';

    this.successMessage = '';

    this.showPasswordForm = true;

  }


  // =========================
  // CHANGE PASSWORD
  // =========================

  changePassword(): void {

    if (!this.passwordUser) {

      return;

    }


    if (this.newPassword.length < 6) {

      this.errorMessage =
        'Password must be at least 6 characters.';

      return;

    }


    this.saving = true;

    this.errorMessage = '';

    this.successMessage = '';


    this.usersService.updatePassword(

      this.passwordUser.id,

      this.newPassword

    ).subscribe({

      next: () => {

        this.saving = false;

        this.showPasswordForm = false;

        this.passwordUser = null;

        this.newPassword = '';


        this.successMessage =
          'Password changed successfully.';


        this.changeDetectorRef.detectChanges();

      },


      error: (error) => {

        console.error(
          'Failed to change password:',
          error
        );

        this.saving = false;

        this.errorMessage =
          'Unable to change password.';

      }

    });

  }


  // =========================
  // CLOSE PASSWORD FORM
  // =========================

  closePasswordForm(): void {

    this.showPasswordForm = false;

    this.passwordUser = null;

    this.newPassword = '';

    this.errorMessage = '';

  }

}
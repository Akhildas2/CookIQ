import { Component, computed, effect, Inject, signal } from '@angular/core';
import { AuthDialogData, AuthMode } from '../../models/auth-dialog.types';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialImportsModule } from '../../../../shared/material/material.imports';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth-service';

@Component({
  selector: 'app-auth-dialog',
  imports: [CommonModule, ReactiveFormsModule, MaterialImportsModule],
  templateUrl: './auth-dialog.html',
  styleUrl: './auth-dialog.css'
})
export class AuthDialog {
  mode = signal<AuthMode>('login');
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  error = signal<string | null>(null);
  form!: FormGroup;
  isLoading = computed(() => this.auth.loading());

  constructor(private fb: FormBuilder, public auth: AuthService, private dialogRef: MatDialogRef<AuthDialog>, @Inject(MAT_DIALOG_DATA) data: AuthDialogData) {
    this.mode.set(data.mode);

    // Initialize the form with controls for email, password, and confirmPassword
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]],
      confirmPassword: ['', []]
    });

    // Close the dialog if the user is already authenticated
    effect(() => {
      if (this.auth.user()) {
        this.dialogRef.close(true);
      }
    });
  }

  // Helper method to get form controls easily in the template
  control(name: string) {
    return this.form.get(name)!;
  }

  // Switch between login and register modes
  switchMode() {
    this.mode.update(m => (m === 'login' ? 'register' : 'login'));
    this.form.get('confirmPassword')?.reset();
    this.error.set(null);
  }

  // Handle form submission for both login and registration
  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Destructure form values for easier access
    const { email, password, confirmPassword } = this.form.value;

    // If in register mode
    if (this.mode() === 'register') {

      // Validate that password and confirmPassword match
      if (password !== confirmPassword) {
        this.error.set('Passwords do not match');
        return;
      }

      // Attempt to register the user and close the dialog on success
      const success = await this.auth.register(email, password);
      if (success) {
        this.dialogRef.close(true);
      }

    } else {

      // Attempt to log in the user and close the dialog on success
      const success = await this.auth.login(email, password);
      if (success) {
        this.dialogRef.close(true);
      }

    }
  }

  // Handle Google login and close the dialog on success
  async googleLogin() {
    await this.auth.loginWithGoogle();
  }

  // Toggle the visibility of the password field
  togglePassword() {
    this.hidePassword.update(v => !v);
  }

  // Toggle the visibility of the confirm password field
  toggleConfirmPassword() {
    this.hideConfirmPassword.update(v => !v);
  }

  // Close the modal
  close() {
    this.dialogRef.close();
  }

}
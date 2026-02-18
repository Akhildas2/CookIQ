import { Component, effect, Inject, signal } from '@angular/core';
import { AuthDialogData, AuthMode } from './auth-dialog.types';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialImportsModule } from '../../material/material.imports';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth-service';

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
  isLoading = () => this.auth.loading();

  constructor(private fb: FormBuilder, public auth: AuthService, private dialogRef: MatDialogRef<AuthDialog>, @Inject(MAT_DIALOG_DATA) data: AuthDialogData) {
    this.mode.set(data.mode);

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]],
      confirmPassword: ['', []]
    });

    effect(() => {
      if (this.auth.user()) {
        this.dialogRef.close(true);
      }
    });
  }

  control(name: string) {
    return this.form.get(name)!;
  }

  switchMode() {
    this.mode.update(m => (m === 'login' ? 'register' : 'login'));
    this.form.get('confirmPassword')?.reset();
    this.error.set(null);
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, confirmPassword } = this.form.value;

    if (this.mode() === 'register') {

      if (password !== confirmPassword) {
        this.error.set('Passwords do not match');
        return;
      }

      const success = await this.auth.register(email, password);
      if (success) {
        this.dialogRef.close(true);
      }

    } else {

      const success = await this.auth.login(email, password);
      if (success) {
        this.dialogRef.close(true);
      }

    }
  }

  async googleLogin() {
    await this.auth.loginWithGoogle();
  }


  togglePassword() {
    this.hidePassword.update(v => !v);
  }

  toggleConfirmPassword() {
    this.hideConfirmPassword.update(v => !v);
  }



}
import { Component, inject } from '@angular/core';
import { ToastService, ToastVariant } from './toast.service';
import { CommonModule } from '@angular/common';
import { MaterialImportsModule } from '../../material/material.imports';

@Component({
  selector: 'app-toast',
  imports: [CommonModule, MaterialImportsModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class Toast {
  constructor(public toastService: ToastService) { }

  severityIcon(severity: ToastVariant): string {
    const icons: Record<ToastVariant, string> = {
      success: 'check_circle',
      info: 'info',
      warning: 'warning',
      error: 'cancel',
      secondary: 'notifications',
      contrast: 'bolt',
    };
    return icons[severity] || 'notifications';
  }

}
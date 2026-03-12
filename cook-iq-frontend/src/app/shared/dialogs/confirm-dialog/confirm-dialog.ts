import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialImportsModule } from '../../material/material.imports';
import { CommonModule } from '@angular/common';
import { zoomInAnimation } from '../../animations/animations';

export interface ConfirmDialogData {
  icon?: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmIcon?: string;
  cancelIcon?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MaterialImportsModule, CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  animations: [zoomInAnimation]
})
export class ConfirmDialog {

  constructor(public dialogRef: MatDialogRef<ConfirmDialog>, @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) { }

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }

  variantStyles = {
    danger: {
      iconBg: 'bg-red-100 ring-4 ring-red-300',
      iconColor: '!text-red-600',
      confirmBtn:
        'bg-red-600 hover:bg-red-700 shadow-md shadow-red-200/60 hover:shadow-lg hover:shadow-red-300/50'
    },

    warning: {
      iconBg: 'bg-amber-100 ring-4 ring-amber-300',
      iconColor: '!text-amber-600',
      confirmBtn:
        'bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-200/60 hover:shadow-lg hover:shadow-amber-300/50'
    },

    success: {
      iconBg: 'bg-emerald-100 ring-4 ring-emerald-300',
      iconColor: '!text-emerald-600',
      confirmBtn:
        'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200/60 hover:shadow-lg hover:shadow-emerald-300/50'
    },

    info: {
      iconBg: 'bg-indigo-100 ring-4 ring-indigo-300',
      iconColor: '!text-indigo-600',
      confirmBtn:
        'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200/60 hover:shadow-lg hover:shadow-indigo-300/50'
    }
  };

  get styles() {
    return this.variantStyles[this.data.variant || 'danger'];
  }

}
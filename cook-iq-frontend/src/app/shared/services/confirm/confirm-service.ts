import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialog, ConfirmDialogData } from '../../dialogs/confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {

  constructor(private dialog: MatDialog) { }

  async confirm(data: ConfirmDialogData): Promise<boolean> {

    const ref = this.dialog.open(ConfirmDialog, {
      data,
      panelClass: 'confirm-dialog-panel'
    });

    const result = await firstValueFrom(ref.afterClosed());

    return !!result;
  }

}
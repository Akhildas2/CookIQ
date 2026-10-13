import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PantryItem } from '../../models/pantry-item.model';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pantry-item-card',
  imports: [LucideIconsModule, DatePipe],
  templateUrl: './pantry-item-card.html',
  styleUrl: './pantry-item-card.css',
})
export class PantryItemCard {
  @Input({ required: true }) item!: PantryItem;

  @Output() edit = new EventEmitter<PantryItem>();
  @Output() delete = new EventEmitter<PantryItem>();

  get freshness(): {
    label: string;
    status: 'fresh' | 'soon' | 'expired' | 'none';
  } {
    if (!this.item.expiryDate) {
      return { label: 'Long lasting', status: 'none' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(`${this.item.expiryDate}T00:00:00`);
    const days = Math.ceil(
      (expiry.getTime() - today.getTime()) / 86_400_000,
    );

    if (days < 0) {
      return { label: 'Past expiry date', status: 'expired' };
    }

    if (days === 0) {
      return { label: 'Expires today', status: 'soon' };
    }

    if (days <= 3) {
      return {
        label: `Use within ${days} day${days === 1 ? '' : 's'}`,
        status: 'soon',
      };
    }

    return { label: 'Fresh', status: 'fresh' };
  }

}
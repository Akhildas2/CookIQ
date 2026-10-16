import { inject, Injectable, signal } from '@angular/core';
import { PantryItem, PantryItemForm, ScannedItem } from '../models/pantry-item.model';
import { ApiService } from '../../../core/services/api/api-service';
import { PANTRY_CATEGORY_ACCENTS } from '../utils/pantry.constants';

type ServerItem = Omit<PantryItem, 'accent'>;
@Injectable({
  providedIn: 'root',
})
export class PantryService {
  private readonly api = inject(ApiService);

  private readonly itemsState = signal<PantryItem[]>([]);
  readonly items = this.itemsState.asReadonly();
  readonly loading = signal(false);
  readonly loadError = signal('');

  private withAccent(i: ServerItem): PantryItem {
    return { ...i, accent: PANTRY_CATEGORY_ACCENTS[i.category] ?? PANTRY_CATEGORY_ACCENTS.Other };
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set('');
    try {
      const res = await this.api.get<{ items: ServerItem[] }>('/pantry/items');
      this.itemsState.set(res.items.map((i) => this.withAccent(i)));
    } catch {
      this.loadError.set('Could not load your pantry.');
    } finally {
      this.loading.set(false);
    }
  }

  async addItem(form: PantryItemForm): Promise<void> {
    const item = await this.api.post<ServerItem>('/pantry/items', form);
    this.itemsState.update((list) => [this.withAccent(item), ...list]);
  }

  async updateItem(id: string, form: PantryItemForm): Promise<void> {
    const item = await this.api.put<ServerItem>(`/pantry/items/${id}`, form);
    this.itemsState.update((list) => list.map((i) => (i.id === id ? this.withAccent(item) : i)));
  }

  async deleteItem(id: string): Promise<void> {
    await this.api.delete(`/pantry/items/${id}`);
    this.itemsState.update((list) => list.filter((i) => i.id !== id));
  }

  async scan(file: File): Promise<{ ingredients: ScannedItem[]; scansRemaining: number | null }> {
    const fd = new FormData();
    fd.append('image', file);
    return this.api.post('/pantry/scan', fd);
  }

  async saveScanned(items: ScannedItem[]): Promise<number> {
    const res = await this.api.post<{ items: ServerItem[] }>('/pantry/items/bulk', { items });
    this.itemsState.update((list) => [...res.items.map((i) => this.withAccent(i)), ...list]);
    return res.items.length;
  }

}
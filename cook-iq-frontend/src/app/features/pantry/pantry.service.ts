
import { Injectable, signal } from '@angular/core';
import {
  PantryItem,
  PantryItemForm,
} from './models/pantry-item.model';

const today = new Date();

function dateFromToday(days: number): string {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const INITIAL_ITEMS: PantryItem[] = [
  {
    id: 'pantry-1',
    name: 'Tomatoes',
    quantity: 6,
    unit: 'pieces',
    category: 'Vegetables',
    emoji: '🍅',
    accent: '#fbe5dc',
    expiryDate: dateFromToday(3),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pantry-2',
    name: 'Avocado',
    quantity: 3,
    unit: 'pieces',
    category: 'Fruits',
    emoji: '🥑',
    accent: '#e4edda',
    expiryDate: dateFromToday(5),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pantry-3',
    name: 'Whole milk',
    quantity: 1,
    unit: 'litre',
    category: 'Dairy',
    emoji: '🥛',
    accent: '#e5edf5',
    expiryDate: dateFromToday(2),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pantry-4',
    name: 'Eggs',
    quantity: 12,
    unit: 'pieces',
    category: 'Proteins',
    emoji: '🥚',
    accent: '#f7ecd7',
    expiryDate: dateFromToday(12),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pantry-5',
    name: 'Spinach',
    quantity: 1,
    unit: 'bunch',
    category: 'Vegetables',
    emoji: '🥬',
    accent: '#dcebdc',
    expiryDate: dateFromToday(1),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pantry-6',
    name: 'Bananas',
    quantity: 5,
    unit: 'pieces',
    category: 'Fruits',
    emoji: '🍌',
    accent: '#f8edc7',
    expiryDate: dateFromToday(4),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pantry-7',
    name: 'Basmati rice',
    quantity: 2,
    unit: 'kg',
    category: 'Grains',
    emoji: '🍚',
    accent: '#f1e9db',
    expiryDate: null,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pantry-8',
    name: 'Red lentils',
    quantity: 500,
    unit: 'g',
    category: 'Grains',
    emoji: '🫘',
    accent: '#f4e1d5',
    expiryDate: null,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pantry-9',
    name: 'Chilli powder',
    quantity: 100,
    unit: 'g',
    category: 'Spices',
    emoji: '🌶️',
    accent: '#f6dfd5',
    expiryDate: dateFromToday(180),
    updatedAt: new Date().toISOString(),
  },
];

@Injectable({
  providedIn: 'root',
})
export class PantryService {
  private readonly itemsState = signal<PantryItem[]>(INITIAL_ITEMS);

  readonly items = this.itemsState.asReadonly();

  addItem(form: PantryItemForm): void {
    const item: PantryItem = {
      id: this.createId(),
      name: form.name.trim(),
      quantity: Number(form.quantity),
      unit: form.unit,
      category: form.category,
      emoji: form.emoji || '🥣',
      accent: this.getAccent(form.category),
      expiryDate: form.expiryDate || null,
      updatedAt: new Date().toISOString(),
    };

    this.itemsState.update((items) => [item, ...items]);
  }

  updateItem(id: string, form: PantryItemForm): void {
    this.itemsState.update((items) =>
      items.map((item) =>
        item.id === id
          ? {
            ...item,
            name: form.name.trim(),
            quantity: Number(form.quantity),
            unit: form.unit,
            category: form.category,
            emoji: form.emoji || item.emoji,
            accent: this.getAccent(form.category),
            expiryDate: form.expiryDate || null,
            updatedAt: new Date().toISOString(),
          }
          : item,
      ),
    );
  }

  deleteItem(id: string): void {
    this.itemsState.update((items) =>
      items.filter((item) => item.id !== id),
    );
  }

  addScannedItems(): number {
    const candidates: PantryItemForm[] = [
      {
        name: 'Red onion',
        quantity: 3,
        unit: 'pieces',
        category: 'Vegetables',
        emoji: '🧅',
        expiryDate: dateFromToday(7),
      },
      {
        name: 'Garlic',
        quantity: 1,
        unit: 'bulb',
        category: 'Vegetables',
        emoji: '🧄',
        expiryDate: dateFromToday(14),
      },
      {
        name: 'Lime',
        quantity: 4,
        unit: 'pieces',
        category: 'Fruits',
        emoji: '🍋',
        expiryDate: dateFromToday(6),
      },
    ];

    const existingNames = new Set(
      this.itemsState().map((item) => item.name.toLowerCase()),
    );

    const newItems = candidates
      .filter((item) => !existingNames.has(item.name.toLowerCase()))
      .map((item): PantryItem => ({
        ...item,
        id: this.createId(),
        accent: this.getAccent(item.category),
        expiryDate: item.expiryDate || null,
        updatedAt: new Date().toISOString(),
      }));

    this.itemsState.update((items) => [...newItems, ...items]);

    return newItems.length;
  }

  private createId(): string {
    return `pantry-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  }

  private getAccent(category: PantryItem['category']): string {
    const accents: Record<PantryItem['category'], string> = {
      Vegetables: '#e4edda',
      Fruits: '#f8edc7',
      Dairy: '#e5edf5',
      Proteins: '#f7ecd7',
      Grains: '#f1e9db',
      Spices: '#f6dfd5',
      Other: '#ece7f4',
    };

    return accents[category];
  }
}

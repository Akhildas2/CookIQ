
export type PantryCategory =
    | 'Vegetables'
    | 'Fruits'
    | 'Dairy'
    | 'Proteins'
    | 'Grains'
    | 'Spices'
    | 'Other';

export type PantryFilter = 'All' | PantryCategory;

export interface PantryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    category: PantryCategory;
    emoji: string;
    accent: string;
    expiryDate: string | null;
    updatedAt: string;
}

export interface PantryItemForm {
    name: string;
    quantity: number;
    unit: string;
    category: PantryCategory;
    emoji: string;
    expiryDate: string;
}

export interface ScannedItem extends PantryItemForm {
  confidence: number;
}
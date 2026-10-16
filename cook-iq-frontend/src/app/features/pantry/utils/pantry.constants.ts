
import type { PantryItem } from '../models/pantry-item.model';

export const PANTRY_CATEGORY_ACCENTS: Record<
    PantryItem['category'],
    string
> = {
    Vegetables: '#e4edda',
    Fruits: '#f8edc7',
    Dairy: '#e5edf5',
    Proteins: '#f7ecd7',
    Grains: '#f1e9db',
    Spices: '#f6dfd5',
    Other: '#ece7f4',
};

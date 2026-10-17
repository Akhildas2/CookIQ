
import type { PantryItem } from '../models/pantry-item.model';
import { PantryCategory, PantryItemForm } from '../models/pantry-item.model';
import { ToolbarFilterOption, ToolbarSortOption } from '../../../shared/components/data-toolbar/data-toolbar.models';

export const PANTRY_CATEGORY_ACCENTS: Record<PantryItem['category'], string> = {
    Vegetables: '#e4edda',
    Fruits: '#f8edc7',
    Dairy: '#e5edf5',
    Proteins: '#f7ecd7',
    Grains: '#f1e9db',
    Spices: '#f6dfd5',
    Other: '#ece7f4',
};


export const PANTRY_CATEGORY_OPTIONS: PantryCategory[] = [
    'Vegetables', 'Fruits', 'Dairy', 'Proteins', 'Grains', 'Spices', 'Other',
];

export const PANTRY_FILTER_OPTIONS: ToolbarFilterOption[] = [
    { value: 'All', label: 'All', icon: 'layout-grid' },
    { value: 'Vegetables', label: 'Vegetables', emoji: '🥦' },
    { value: 'Fruits', label: 'Fruits', emoji: '🍎' },
    { value: 'Dairy', label: 'Dairy', emoji: '🥛' },
    { value: 'Proteins', label: 'Proteins', emoji: '🥚' },
    { value: 'Grains', label: 'Grains', emoji: '🌾' },
    { value: 'Spices', label: 'Spices', emoji: '🌶️' },
    { value: 'Other', label: 'Other', emoji: '🥣' },
];

export const PANTRY_SORT_OPTIONS: ToolbarSortOption[] = [
    { value: 'name', label: 'Name (A–Z)' },
    { value: 'expiry', label: 'Expiring soonest' },
    { value: 'quantity', label: 'Largest quantity' },
];

export const PANTRY_EMOJI_OPTIONS = [
    '🥦', '🥕', '🍅', '🥑', '🍎', '🍌', '🥛', '🧀', '🥚',
    '🍗', '🐟', '🍚', '🫘', '🌶️', '🧄', '🧅', '🍋', '🥣',
];

export const PANTRY_UNIT_OPTIONS = [
    'pieces', 'kg', 'g', 'litre', 'ml', 'bunch', 'pack', 'bottle', 'bulb',
];

export function emptyPantryForm(): PantryItemForm {
    return {
        name: '',
        quantity: 1,
        unit: 'pieces',
        category: 'Vegetables',
        emoji: '🥦',
        expiryDate: '',
    };
}
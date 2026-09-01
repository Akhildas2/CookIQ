export function getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
        Beef: '🥩', Chicken: '🍗', Dessert: '🍰', Lamb: '🍖',
        Miscellaneous: '🍴', Pasta: '🍝', Pork: '🥓', Seafood: '🦐',
        Side: '🥗', Starter: '🥟', Vegan: '🥬', Vegetarian: '🥕',
        Breakfast: '🍳', Goat: '🐐',
    };
    return emojiMap[category] ?? '🍽️';
}

export function getCountryFlag(country: string): string {
    const emojiMap: Record<string, string> = {
        American: '🗽', British: '👑', Canadian: '🍁', Chinese: '🐉',
        French: '🥐', Greek: '🏛️', Indian: '🪷', Italian: '🍕',
        Japanese: '🗾', Mexican: '🌮', Spanish: '💃', Thai: '🛕',
        Turkish: '🧿', Vietnamese: '🍜',
    };
    return emojiMap[country] ?? '🌍';
}
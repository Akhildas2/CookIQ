import { MyRecipe } from "../models/my-recipes.models";

export const MY_RECIPES: readonly MyRecipe[] = [
    {
        id: 'rustic-tomato-pasta',
        title: 'Rustic Tomato Basil Pasta',
        description:
            'A simple tomato pasta finished with fresh basil and parmesan.',
        imageUrl: '/assets/pasta-dish.png',
        category: 'Pasta',
        cuisine: 'Italian',
        prepTime: 10,
        cookTime: 15,
        servings: 2,
        ingredients: [
            {
                name: 'Pasta',
                quantity: '200',
                unit: 'g',
            },
            {
                name: 'Tomato',
                quantity: '3',
                unit: 'medium',
            },
            {
                name: 'Fresh basil',
                quantity: '1',
                unit: 'handful',
            },
        ],
        instructions: [
            'Boil the pasta until al dente.',
            'Prepare the tomato sauce.',
            'Combine the pasta and sauce.',
            'Finish with fresh basil and parmesan.',
        ],
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
    },
    {
        id: 'spiced-chicken-bowl',
        title: 'Spiced Chicken Bowl',
        description:
            'A warm and satisfying chicken bowl with vegetables and fragrant spices.',
        imageUrl: '/assets/chicken-bowl.jpg',
        category: 'Chicken',
        cuisine: 'Indian',
        prepTime: 15,
        cookTime: 25,
        servings: 2,
        ingredients: [
            {
                name: 'Chicken',
                quantity: '300',
                unit: 'g',
            },
            {
                name: 'Rice',
                quantity: '200',
                unit: 'g',
            },
            {
                name: 'Mixed vegetables',
                quantity: '1',
                unit: 'cup',
            },
        ],
        instructions: [
            'Season and prepare the chicken.',
            'Cook the rice until tender.',
            'Cook the vegetables with spices.',
            'Assemble everything in a bowl.',
        ],
        createdAt: '2026-09-28',
        updatedAt: '2026-09-29',
    },
    {
        id: 'coconut-vegetable-curry',
        title: 'Coconut Vegetable Curry',
        description:
            'A creamy coconut curry packed with seasonal vegetables and gentle spices.',
        imageUrl: '/assets/vegetable-curry.jpg',
        category: 'Vegetarian',
        cuisine: 'Indian',
        prepTime: 10,
        cookTime: 30,
        servings: 4,
        ingredients: [
            {
                name: 'Mixed vegetables',
                quantity: '3',
                unit: 'cups',
            },
            {
                name: 'Coconut milk',
                quantity: '400',
                unit: 'ml',
            },
            {
                name: 'Curry powder',
                quantity: '2',
                unit: 'tsp',
            },
        ],
        instructions: [
            'Prepare and chop the vegetables.',
            'Cook the spices until fragrant.',
            'Add the vegetables and coconut milk.',
            'Simmer until everything is tender.',
        ],
        createdAt: '2026-09-24',
        updatedAt: '2026-09-24',
    },
];
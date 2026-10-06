import { Component, input } from '@angular/core';
import { MyRecipe } from '../../models/my-recipes.models';
import { MyRecipeCard } from '../my-recipe-card/my-recipe-card';

@Component({
  selector: 'app-my-recipes-grid',
  imports: [MyRecipeCard],
  templateUrl: './my-recipes-grid.html',
  styleUrl: './my-recipes-grid.css',
})
export class MyRecipesGrid {
  readonly recipes = input.required<readonly MyRecipe[]>();
}

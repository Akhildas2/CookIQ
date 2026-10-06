import { Component, input } from '@angular/core';
import { MyRecipe } from '../../models/my-recipes.models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-recipe-card',
  imports: [RouterLink],
  templateUrl: './my-recipe-card.html',
  styleUrl: './my-recipe-card.css',
})
export class MyRecipeCard {
  readonly recipe=input.required<MyRecipe>();
}

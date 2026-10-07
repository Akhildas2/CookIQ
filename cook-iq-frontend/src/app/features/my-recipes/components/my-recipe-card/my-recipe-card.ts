import { Component, input } from '@angular/core';
import { MyRecipe } from '../../models/my-recipes.models';
import { RouterLink } from '@angular/router';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal';

@Component({
  selector: 'app-my-recipe-card',
  imports: [RouterLink, ScrollReveal],
  templateUrl: './my-recipe-card.html',
  styleUrl: './my-recipe-card.css',
})
export class MyRecipeCard {
  readonly recipe = input.required<MyRecipe>();
  readonly index = input.required<number>();
}
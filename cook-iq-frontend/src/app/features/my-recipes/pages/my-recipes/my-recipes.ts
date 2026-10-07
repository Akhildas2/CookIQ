import { Component } from '@angular/core';
import { MyRecipesToolbar } from '../../components/my-recipes-toolbar/my-recipes-toolbar';
import { MyRecipesGrid } from '../../components/my-recipes-grid/my-recipes-grid';
import { MY_RECIPES } from '../../data/my-recipes.data';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal';
import { SectionHeader } from '../../../../shared/ui/section-header/section-header';

@Component({
  selector: 'app-my-recipes',
  imports: [SectionHeader, MyRecipesToolbar, MyRecipesGrid ,ScrollReveal],
  templateUrl: './my-recipes.html',
  styleUrl: './my-recipes.css',
})
export class MyRecipes {
  readonly recipes = MY_RECIPES;
  
}
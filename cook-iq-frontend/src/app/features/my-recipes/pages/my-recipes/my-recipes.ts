import { Component } from '@angular/core';
import { MyRecipesHeader } from '../../components/my-recipes-header/my-recipes-header';
import { MyRecipesToolbar } from '../../components/my-recipes-toolbar/my-recipes-toolbar';
import { MyRecipesGrid } from '../../components/my-recipes-grid/my-recipes-grid';
import { MY_RECIPES } from '../../data/my-recipes.data';

@Component({
  selector: 'app-my-recipes',
  imports: [MyRecipesHeader, MyRecipesToolbar, MyRecipesGrid],
  templateUrl: './my-recipes.html',
  styleUrl: './my-recipes.css',
})
export class MyRecipes {
  readonly recipes = MY_RECIPES;
  
}
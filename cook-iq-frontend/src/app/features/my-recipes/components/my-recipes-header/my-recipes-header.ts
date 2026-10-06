import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-recipes-header',
  imports: [RouterLink],
  templateUrl: './my-recipes-header.html',
  styleUrl: './my-recipes-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyRecipesHeader {

}
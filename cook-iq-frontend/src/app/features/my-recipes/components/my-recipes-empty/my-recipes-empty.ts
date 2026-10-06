import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-recipes-empty',
  imports: [RouterLink],
  templateUrl: './my-recipes-empty.html',
  styleUrl: './my-recipes-empty.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class MyRecipesEmpty {

}

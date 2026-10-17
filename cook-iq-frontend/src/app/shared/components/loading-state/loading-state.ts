import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  imports: [],
  templateUrl: './loading-state.html',
  styleUrl: './loading-state.css',
})
export class LoadingState {
readonly message = input('Loading…');

}
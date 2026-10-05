import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { RouterOutlet } from '@angular/router';
import { Cursor } from '../../../shared/ui/cursor/cursor';

@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, Header, Footer, Cursor],
  templateUrl: './app-layout.html',
})
export class AppLayout {

}
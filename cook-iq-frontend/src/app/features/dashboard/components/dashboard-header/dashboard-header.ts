import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-header',
  imports: [RouterLink],
  templateUrl: './dashboard-header.html',
  styleUrl: './dashboard-header.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class DashboardHeader {

}
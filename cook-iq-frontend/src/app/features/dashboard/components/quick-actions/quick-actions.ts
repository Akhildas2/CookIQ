import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DASHBOARD_QUICK_ACTIONS } from '../../data/dashboard.data';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';

@Component({
  selector: 'app-quick-actions',
  imports: [RouterLink,LucideIconsModule],
  templateUrl: './quick-actions.html',
  styleUrl: './quick-actions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickActions {
  readonly actions = DASHBOARD_QUICK_ACTIONS;
}
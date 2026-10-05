import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SiteStat } from '../../models/home.models';
import { SITE_STATS } from '../../data/home.data';
import { CountUp } from '../../../../shared/directives/count-up/count-up';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal';

@Component({
  selector: 'app-stats-section',
  imports: [CountUp, ScrollReveal],
  templateUrl: './stats-section.html',
  styleUrl: './stats-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsSection {
  protected readonly stats = SITE_STATS;

  /**
   * Screen readers receive the final value,
   * never the intermediate count-up animation.
   */
  protected spoken(stat: SiteStat): string {
    const value =
      stat.text ??
      `${stat.prefix ?? ''}${(stat.value ?? 0).toFixed(stat.decimals ?? 0)}${stat.suffix ?? ''}`;

    return `${value} ${stat.label}`;
  }

}
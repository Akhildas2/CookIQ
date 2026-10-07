import { NgModule } from '@angular/core';

import {
  LucideAngularModule,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Camera,
  Check,
  ChefHat,
  Clock,
  Flame,
  Leaf,
  Quote,
  ScanLine,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,

} from 'lucide-angular';

@NgModule({
  imports: [
    LucideAngularModule.pick({
      Sparkles,
      ArrowDown,
      ArrowLeft,
      ArrowRight,
      ArrowUpRight,
      ArrowDownRight,
      Flame,
      ChefHat,
      Clock,
      Users,
      Leaf,
      ScanLine,
      Camera,
      Search,
      BookOpen,
      Check,
      Star,
      TrendingUp,
      Zap,
      Shield,
      Quote,
      SlidersHorizontal,
    }),
  ],
  exports: [LucideAngularModule],
})
export class LucideIconsModule { }
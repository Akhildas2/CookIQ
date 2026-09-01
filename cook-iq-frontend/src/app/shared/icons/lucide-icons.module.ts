import { NgModule } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import {
  // Hero Section
  Sparkles,
  ArrowRight,
  Flame,
  ChefHat,
  Clock,
  Users,
  Leaf,
  ScanLine,

  // Features Section 
  Camera,
  Search,
  BookOpen,

  // How It Works / General
  Check,
  Star,
  TrendingUp,
  Zap,
  Shield,
  Quote,
} from 'lucide-angular';

@NgModule({
  imports: [
    LucideAngularModule.pick({
      Sparkles,
      ArrowRight,
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
    })
  ],
  exports: [LucideAngularModule]
})
export class LucideIconsModule { }
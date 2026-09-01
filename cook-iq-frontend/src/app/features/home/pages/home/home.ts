import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { HeroSection } from '../../components/hero-section/hero-section';
import { FeaturesSection } from '../../components/features-section/features-section';
import { HowItWorksSection } from '../../components/how-it-works-section/how-it-works-section';
import { TestimonialsSection } from '../../components/testimonials-section/testimonials-section';
import { StatsSection } from '../../components/stats-section/stats-section';
import { CtaSection } from '../../components/cta-section/cta-section';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [HeroSection, FeaturesSection, HowItWorksSection, TestimonialsSection, StatsSection, CtaSection],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {

  private io!: IntersectionObserver;
  private cursorEl!: HTMLElement;
  private ringEl!: HTMLElement;
  private rx = 0; private ry = 0;
  private mx = 0; private my = 0;
  private rafId!: number;
  private lastParticle = 0;

  private onMouseMove!: (e: MouseEvent) => void;
  private onScroll!: () => void;

  constructor(@Inject(PLATFORM_ID) private platformId: object) { }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Slight delay so DOM is ready
    requestAnimationFrame(() => {
      this.initCursor();
      this.initNavScroll();
      this.initScrollReveal();
    });
  }

  /* ── Custom cursor ───────────────────────────────────── */
  private initCursor() {
    this.cursorEl = document.getElementById('cursor')!;
    this.ringEl = document.getElementById('cursor-ring')!;
    if (!this.cursorEl || !this.ringEl) return;

    this.onMouseMove = (e: MouseEvent) => {
      this.mx = e.clientX; this.my = e.clientY;
      this.cursorEl.style.left = this.mx + 'px';
      this.cursorEl.style.top = this.my + 'px';
      this.emitParticle(e);
    };

    document.addEventListener('mousemove', this.onMouseMove);

    const animRing = () => {
      this.rx += (this.mx - this.rx) * 0.12;
      this.ry += (this.my - this.ry) * 0.12;
      this.ringEl.style.left = this.rx + 'px';
      this.ringEl.style.top = this.ry + 'px';
      this.rafId = requestAnimationFrame(animRing);
    };
    this.rafId = requestAnimationFrame(animRing);

    document.querySelectorAll('a, button, .feat-card, .tcard').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
  }

  /* ── Cursor particle trail ───────────────────────────── */
  private emitParticle(e: MouseEvent) {
    if (Date.now() - this.lastParticle < 80) return;
    this.lastParticle = Date.now();
    const p = document.createElement('div');
    p.className = 'cursor-particle';
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 30;
    p.style.cssText =
      `left:${e.clientX}px;top:${e.clientY}px;` +
      `--dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }

  /* ── Nav scroll glass effect ─────────────────────────── */
  private initNavScroll() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    this.onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  /* ── Scroll reveal via IntersectionObserver ──────────── */
  private initScrollReveal() {
    this.io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          this.io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('[data-reveal]').forEach(el => this.io.observe(el));
  }

  ngOnDestroy() {
    if (this.onMouseMove) document.removeEventListener('mousemove', this.onMouseMove);
    if (this.onScroll) window.removeEventListener('scroll', this.onScroll);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.io?.disconnect();
  }
}
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingModal } from './pricing-modal';

describe('PricingModal', () => {
  let component: PricingModal;
  let fixture: ComponentFixture<PricingModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricingModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

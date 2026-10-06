import { TestBed } from '@angular/core/testing';

import { MealdbService } from './mealdb-service';

describe('MealdbService', () => {
  let service: MealdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MealdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

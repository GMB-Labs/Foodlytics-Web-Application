import { TestBed } from '@angular/core/testing';

import { DailyCalorieDistributionService } from './daily-calorie-distribution.service';

describe('DailyCalorieDistributionService', () => {
  let service: DailyCalorieDistributionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailyCalorieDistributionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

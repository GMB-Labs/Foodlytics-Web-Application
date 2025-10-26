import { TestBed } from '@angular/core/testing';

import { MacroTargetsService } from './macro-targets.service';

describe('MacroTargetsService', () => {
  let service: MacroTargetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MacroTargetsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

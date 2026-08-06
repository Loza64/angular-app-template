import { TestBed } from '@angular/core/testing';

import { SdkSettingsService } from './sdk-settings';

describe('SdkSettings', () => {
  let service: SdkSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SdkSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

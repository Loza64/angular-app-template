import { TestBed } from '@angular/core/testing';

import { Permission } from './permission';

describe('Permission', () => {
  let service: Permission;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Permission);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

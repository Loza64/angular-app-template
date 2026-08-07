import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMultipleApi } from './select-multiple-api';

describe('SelectMultipleApi', () => {
  let component: SelectMultipleApi;
  let fixture: ComponentFixture<SelectMultipleApi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectMultipleApi],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectMultipleApi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

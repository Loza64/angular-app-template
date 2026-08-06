import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectApi } from './select-api';

describe('SelectApi', () => {
  let component: SelectApi;
  let fixture: ComponentFixture<SelectApi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectApi],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectApi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

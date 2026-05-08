import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modulo } from './modulo';

describe('Modulo', () => {
  let component: Modulo;
  let fixture: ComponentFixture<Modulo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modulo],
    }).compileComponents();

    fixture = TestBed.createComponent(Modulo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

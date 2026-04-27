import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispositivosComponent } from './dispositivos';

describe('DispositivosComponent', () => {
  let component: DispositivosComponent;
  let fixture: ComponentFixture<DispositivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DispositivosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DispositivosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
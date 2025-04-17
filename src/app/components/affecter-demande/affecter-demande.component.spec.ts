import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffecterDemandeComponent } from './affecter-demande.component';

describe('AffecterDemandeComponent', () => {
  let component: AffecterDemandeComponent;
  let fixture: ComponentFixture<AffecterDemandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffecterDemandeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AffecterDemandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeContratComponent } from './demande-contrat.component';

describe('DemandeContratComponent', () => {
  let component: DemandeContratComponent;
  let fixture: ComponentFixture<DemandeContratComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeContratComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeContratComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

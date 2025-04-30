import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeAutorisationSortieComponent } from './demande-autorisation-sortie.component';

describe('DemandeAutorisationSortieComponent', () => {
  let component: DemandeAutorisationSortieComponent;
  let fixture: ComponentFixture<DemandeAutorisationSortieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeAutorisationSortieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeAutorisationSortieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

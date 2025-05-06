import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListedemandeContratComponent } from './listedemande-contrat.component';

describe('ListedemandeContratComponent', () => {
  let component: ListedemandeContratComponent;
  let fixture: ComponentFixture<ListedemandeContratComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListedemandeContratComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListedemandeContratComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

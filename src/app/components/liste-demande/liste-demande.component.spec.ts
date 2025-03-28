import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeDemandeComponent } from './liste-demande.component';

describe('ListeDemandeComponent', () => {
  let component: ListeDemandeComponent;
  let fixture: ComponentFixture<ListeDemandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeDemandeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeDemandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeInterventionComponent } from './liste-intervention.component';

describe('ListeInterventionComponent', () => {
  let component: ListeInterventionComponent;
  let fixture: ComponentFixture<ListeInterventionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeInterventionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeInterventionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

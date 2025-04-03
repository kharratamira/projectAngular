import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeCommercialComponent } from './liste-commercial.component';

describe('ListeCommercialComponent', () => {
  let component: ListeCommercialComponent;
  let fixture: ComponentFixture<ListeCommercialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeCommercialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeCommercialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

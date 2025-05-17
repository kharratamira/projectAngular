import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeSatisfactionClientComponent } from './liste-satisfaction-client.component';

describe('ListeSatisfactionClientComponent', () => {
  let component: ListeSatisfactionClientComponent;
  let fixture: ComponentFixture<ListeSatisfactionClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeSatisfactionClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeSatisfactionClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

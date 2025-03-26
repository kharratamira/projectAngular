import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeCompteComponent } from './liste-compte.component';

describe('ListeCompteComponent', () => {
  let component: ListeCompteComponent;
  let fixture: ComponentFixture<ListeCompteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeCompteComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ListeCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

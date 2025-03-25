import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeClientsComponent } from './liste-clients.component';

describe('ListeClientsComponent', () => {
  let component: ListeClientsComponent;
  let fixture: ComponentFixture<ListeClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeClientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

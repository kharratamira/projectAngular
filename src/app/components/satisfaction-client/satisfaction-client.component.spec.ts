import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SatisfactionClientComponent } from './satisfaction-client.component';

describe('SatisfactionClientComponent', () => {
  let component: SatisfactionClientComponent;
  let fixture: ComponentFixture<SatisfactionClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SatisfactionClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SatisfactionClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

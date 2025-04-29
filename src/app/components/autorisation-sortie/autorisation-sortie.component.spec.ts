import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutorisationSortieComponent } from './autorisation-sortie.component';

describe('AutorisationSortieComponent', () => {
  let component: AutorisationSortieComponent;
  let fixture: ComponentFixture<AutorisationSortieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutorisationSortieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutorisationSortieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

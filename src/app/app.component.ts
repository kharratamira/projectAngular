import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AccueillComponent } from './components/accueill/accueill.component';
import { HeaderComponent } from './components/header/header.component';
import { DemandeInterventionComponent } from './components/demande-intervention/demande-intervention.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet,],
  template: '<app-header></app-header><router-outlet></router-outlet>',
  styleUrl:'./app.component.css'
})
export class AppComponent {
  title = 'frontend_pfe';
}

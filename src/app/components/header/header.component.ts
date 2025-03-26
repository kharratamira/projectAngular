import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  userNom: string | null = '';
  userPrenom: string | null = '';

  constructor(private router: Router) { }
  ngOnInit(): void {
    this.userNom = sessionStorage.getItem('userNom');
    this.userPrenom = sessionStorage.getItem('userPrenom');
    console.log('Nom récupéré dans navbar:', this.userNom);
    console.log('Prénom récupéré dans navbar:', this.userPrenom);
    if (!this.userNom || !this.userPrenom) {
      console.warn('No user data found in sessionStorage!');
    }
  }

  logout() {
    // Clear sessionStorage
    sessionStorage.clear();
    // Redirect to login
    window.location.href = '/login'; // You can use this.router.navigate(['/login']) instead
    console.log('Logged out');
  }
}

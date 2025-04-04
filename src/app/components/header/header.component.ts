import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  userNom: string | null = '';
  userPrenom: string | null = '';
  userPhoto: string | null = '';
  baseUrl = 'http://localhost:8000/uploads/users/'; 
  constructor(private router: Router) { }
  ngOnInit(): void {
    this.userNom = sessionStorage.getItem('userNom');
    this.userPrenom = sessionStorage.getItem('userPrenom');
    this.userPhoto = sessionStorage.getItem('userPhoto');
    console.log('Nom récupéré dans navbar:', this.userNom);
    console.log('Prénom récupéré dans navbar:', this.userPrenom);
    console.log('photo récupéré dans navbar:', this.userPhoto);
    if (!this.userNom || !this.userPrenom) {
      console.warn('No user data found in sessionStorage!');
    }
  }
  getPhotoUrl(photo: string | null): string {
    if (!photo) return '';
    if (photo.startsWith('http') || photo.startsWith('data:')) {
      return photo;
    }
    return this.baseUrl + photo;
  }
  logout() {
    // Clear sessionStorage
    sessionStorage.clear();
    // Redirect to login
    window.location.href = '/login'; // You can use this.router.navigate(['/login']) instead
    console.log('Logged out');
  }
}

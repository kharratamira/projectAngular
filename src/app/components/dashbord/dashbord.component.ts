import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [RouterLink,CommonModule,RouterOutlet],
  templateUrl: './dashbord.component.html',
  styleUrl: './dashbord.component.css'
})
export class DashbordComponent {
  toggleSidebar() {
    document.body.classList.toggle('sidebar-toggled');
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('toggled');
  }
  constructor(private router: Router) {}
  userNom: string | null = '';
  userPrenom: string | null = '';

  nngOnInit(): void {
    this.userNom = sessionStorage.getItem('userNom');
    this.userPrenom = sessionStorage.getItem('userPrenom');
  
    if (!this.userNom || !this.userPrenom) {
      // Handle the case when user data is not found, perhaps redirect to login
      console.warn('User not found in sessionStorage. Redirecting to login...');
      this.router.navigate(['/login']);
    }
}}

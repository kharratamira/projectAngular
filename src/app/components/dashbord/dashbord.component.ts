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
  userNom: string | null = '';
  userPrenom: string | null = '';
  userEmail: string | null = '';
  roles: string[] = [];
  toggleSidebar() {
    document.body.classList.toggle('sidebar-toggled');
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('toggled');
  }
  constructor(private router: Router) {}
 

//   ngOnInit(): void {
//     this.userNom = sessionStorage.getItem('userNom');
//     this.userPrenom = sessionStorage.getItem('userPrenom');
  
//     if (!this.userNom || !this.userPrenom) {
//       // Handle the case when user data is not found, perhaps redirect to login
//       console.warn('User not found in sessionStorage. Redirecting to login...');
//       this.router.navigate(['/login']);
//     }
// }
ngOnInit(): void {
  this.loadUserData();
  
  if (!this.userNom || !this.userPrenom || this.roles.length === 0) {
    this.router.navigate(['/login']);
  }
}

loadUserData(): void {
  this.userNom = sessionStorage.getItem('userNom');
  this.userPrenom = sessionStorage.getItem('userPrenom');
  this.userEmail = sessionStorage.getItem('userEmail');
  
  // Récupération des rôles avec vérification de null
  const rolesString = sessionStorage.getItem('roles');
  this.roles = rolesString ? JSON.parse(rolesString) : [];
  
  console.log('Données utilisateur chargées:', {
    nom: this.userNom,
    prenom: this.userPrenom,
    roles: this.roles
  });
}

hasRole(role: string): boolean {
  // Vérifie si le rôle existe exactement dans le tableau
  return this.roles.includes(role);
}
}

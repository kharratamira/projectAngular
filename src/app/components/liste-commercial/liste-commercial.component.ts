import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-liste-commercial',
  standalone: true,
  imports: [FormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './liste-commercial.component.html',
  styleUrl: './liste-commercial.component.css'
})
export class ListeCommercialComponent implements OnInit {
  users: any[] = [];
  errorMessage: string = '';
  filteredUser: any[] = [];
  currentPage: number = 1;
  selectedUser: any = null;
  isEditing: boolean = false;

  filters = {
    id: '',
    nom: '',
    prenom: '',
    email: '',
    numTel: '',
    user_type: '',
    region: '',
    date_creation: ''
  };
  baseUrl = 'http://localhost:8000/uploads/users/';
  constructor(private authService: AuthService, private http: HttpClient) { }

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.authService.getCommercial().subscribe({
      next: (data) => {
        this.users = data.map((user: any) => ({
          ...user,
          isActive: user.isActive !== false // true par défaut si undefined
        }));
        this.filteredUser = [...this.users]; // Crée une nouvelle référence
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données', error);
      }
    });
  }

  applyFilters() {
    this.filteredUser = this.users.filter(user =>
      (this.filters.id ? user.id.toString().includes(this.filters.id) : true) &&
      (this.filters.nom ? user.nom.toLowerCase().includes(this.filters.nom.toLowerCase()) : true) &&
      (this.filters.prenom ? user.prenom.toLowerCase().includes(this.filters.prenom.toLowerCase()) : true) &&
      (this.filters.email ? user.email.toLowerCase().includes(this.filters.email.toLowerCase()) : true) &&
      (this.filters.numTel ? user.numTel.toString().includes(this.filters.numTel) : true) &&
      (this.filters.user_type ? user.user_type.toLowerCase().includes(this.filters.user_type.toLowerCase()) : true) &&
      (this.filters.region ? (user.region || '').toString().toLowerCase().includes(this.filters.region.toLowerCase()) : true) &&
      (this.filters.date_creation ? (user.date_creation || '').toString().toLowerCase().includes(this.filters.date_creation.toLowerCase()) : true)
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (this.selectedUser) {
          this.selectedUser.photo = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  editCommercial(user: any) {
    this.selectedUser = { ...user };
    this.isEditing = true;
  }

  updateUser() {
    if (this.selectedUser) {
      Swal.fire({
        title: 'Confirmer la mise à jour',
        text: 'Êtes-vous sûr de vouloir mettre à jour cet utilisateur ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, mettre à jour',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this.authService.updateCommercial(this.selectedUser.id, this.selectedUser).subscribe({
            next: (response) => {
              Swal.fire({
                icon: 'success',
                title: 'Mise à jour réussie',
                text: 'L\'utilisateur a été mis à jour avec succès.',
                timer: 3000,
                timerProgressBar: true
              });
              this.loadUser();
              this.isEditing = false;
              this.selectedUser = null;
            },
            error: (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Échec de la mise à jour',
                text: 'Une erreur s\'est produite lors de la mise à jour de l\'utilisateur.',
                confirmButtonColor: '#d33'
              });
              console.error('Erreur lors de la mise à jour du commercial', error);
            }
          });
        }
      });
    }
  }

  activerUser(user: any) {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action activera le compte.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, activer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.activeUser(user.id).subscribe({
          next: () => {
            user.isActive = true; // Mise à jour immédiate
            Swal.fire({
              icon: 'success',
              title: 'Activé !',
              text: 'Le compte a été activé avec succès.',
              timer: 3000,
              timerProgressBar: true
            });
            this.loadUser(); // Rechargement des données
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Une erreur s\'est produite lors de l\'activation.',
              confirmButtonColor: '#d33'
            });
            console.error('Erreur lors de l\'activation :', error);
          }
        });
      }
    });
  }
  
  desactiverUser(user: any) {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action désactivera le compte.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, désactiver',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.desactiverUser(user.id).subscribe({
          next: () => {
            user.isActive = false; // Mise à jour immédiate
            Swal.fire({
              icon: 'success',
              title: 'Désactivé !',
              text: 'Le compte a été désactivé avec succès.',
              timer: 3000,
              timerProgressBar: true
            });
            this.loadUser(); // Rechargement des données
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Une erreur s\'est produite lors de la désactivation.',
              confirmButtonColor: '#d33'
            });
            console.error('Erreur lors de la désactivation :', error);
          }
        });
      }
    });
  }
 
}
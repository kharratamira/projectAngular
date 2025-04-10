import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-liste-compte',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './liste-compte.component.html',
  styleUrls: ['./liste-compte.component.css']
})
export class ListeCompteComponent implements OnInit {
  users: any[] = [];
  errorMessage: string = '';
  filteredUser: any[] = [];
  currentPage: number = 1;
  selectedUser: any = null;
  isEditing: boolean = false;
  baseUrl = 'http://localhost:8000/uploads/users/';

  constructor(private authService: AuthService, private http: HttpClient) { }

  filters = {
    id: '',
    nom: '',
    prenom: '',
    email: '',
    numTel: '',
    //user_type: '',
    //disponibilite: '',
    specialite: '',
    date_creation: ''
  };

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.authService.getTechnicien().subscribe({
      next: (data: any[]) => {
        this.users = data.map((user: any) => ({
          ...user,
          isActive: user.isActive !== false
        }));
        this.filteredUser = this.users;
      },
      // ... reste du code
    });
  }

  applyFilters() {
    this.filteredUser = this.users.filter(user =>
      (this.filters.id ? user.id.toString().includes(this.filters.id) : true) &&
      (this.filters.nom ? user.nom.toString().includes(this.filters.nom) : true) &&
      (this.filters.prenom ? user.prenom.toLowerCase().includes(this.filters.prenom.toLowerCase()) : true) &&
      (this.filters.email ? user.email.toLowerCase().includes(this.filters.email.toLowerCase()) : true) &&
      (this.filters.numTel ? user.numTel.toString().includes(this.filters.numTel) : true) &&
     // (this.filters.user_type ? user.user_type.toLowerCase().includes(this.filters.user_type.toLowerCase()) : true) &&
      //(this.filters.disponibilite ? user.disponibilite.toString().toLowerCase().includes(this.filters.disponibilite.toLowerCase()) : true) &&
      (this.filters.specialite ? user.specialite.toLowerCase().includes(this.filters.specialite.toLowerCase()) : true) &&
      (this.filters.date_creation ? user.date_creation.toLowerCase().includes(this.filters.date_creation.toLowerCase()) : true)
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
  editUser(user: any) {
    this.selectedUser = { ...user };
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
          this.authService.updateTechnicien(this.selectedUser.id, this.selectedUser).subscribe({
            next: (response) => {
              Swal.fire({
                icon: 'success',
                title: 'Mise à jour réussie',
                text: 'L\'utilisateur a été mis à jour avec succès.',
                timer: 3000,
                timerProgressBar: true
              });
              console.log('Technicien mis à jour avec succès', response);
              this.loadUser(); // Recharger la liste des utilisateurs
              this.isEditing = false;
            },
            error: (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Échec de la mise à jour',
                text: 'Une erreur s\'est produite lors de la mise à jour de l\'utilisateur.',
                confirmButtonColor: '#d33'
              });
              console.error('Erreur lors de la mise à jour du technicien', error);
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
            Swal.fire({
              icon: 'success',
              title: 'Activé !',
              text: 'Le compte a été activé avec succès.',
              timer: 3000, // Timer de 3 secondes
              timerProgressBar: true
            });
            // Mettre à jour l'état localement
            user.isActive = true;
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
  // Désactiver un technicien
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
            Swal.fire({
              icon: 'success',
              title: 'Désactivé !',
              text: 'Le compte a été désactivé avec succès.',
              timer: 3000, // Timer de 3 secondes
              timerProgressBar: true
            });
            // Mettre à jour l'état localement
            user.isActive = false;
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
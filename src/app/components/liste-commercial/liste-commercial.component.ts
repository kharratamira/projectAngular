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

  constructor(private authService: AuthService, private http: HttpClient) { }

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.authService.getCommercial().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUser = [...this.users];
        console.log('User data:', data);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la récupération des utilisateurs';
        console.error('There was an error!', error);
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

  deleteCommercial(userId: number) {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Vous ne pourrez pas revenir en arrière !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.deleteCommercial(userId).subscribe({
          next: (response) => {
            Swal.fire('Supprimé !', 'Le commercial a été supprimé.', 'success');
            this.loadUser();
          },
          error: (error) => {
            Swal.fire('Erreur', 'Une erreur s\'est produite lors de la suppression du commercial.', 'error');
            console.error('Erreur lors de la suppression du commercial', error);
          }
        });
      }
    });
  }
}
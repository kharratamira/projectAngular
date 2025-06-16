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
  currentPage: number = 1;
  selectedUser: any = null;
  isEditing: boolean = false;
  baseUrl = 'http://localhost:8000/uploads/users/';
  searchText: string = '';

  constructor(private authService: AuthService, private http: HttpClient) { }

 

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
      
      },
      
    });
  }

  
    get filteredUsers() {
    const search = this.searchText.toLowerCase();
    return this.users.filter(user =>
      user.id?.toString().includes(search) ||
      user.nom?.toLowerCase().includes(search) ||
      user.prenom?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.numTel?.toString().includes(search) ||
      user.specialite?.toLowerCase().includes(search) ||
      user.date_creation?.toLowerCase().includes(search)
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
 
  editTechnicien(technicien: any): void {
  Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: 'Voulez-vous modifier ce technicien ?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Oui, modifier',
    cancelButtonText: 'Annuler',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
  }).then((result) => {
    if (result.isConfirmed) {
      this.selectedUser = { ...technicien };

      Swal.fire({
        title: 'Modifier le technicien',
        html: `
          <form id="edit-technicien-form">
            <div class="form-group d-flex flex-column align-items-start mb-2">
              <label for="edit-nom" class="form-label fw-semibold text-start" style="color: #22325d;">Nom :</label>
              <input type="text" id="edit-nom" class="form-control shadow-sm border-primary" value="${this.selectedUser.nom || ''}">
            </div>
            <div class="form-group d-flex flex-column align-items-start mb-2">
              <label for="edit-prenom" class="form-label fw-semibold">Prénom :</label>
              <input type="text" id="edit-prenom" class="form-control shadow-sm border-primary" value="${this.selectedUser.prenom || ''}">
            </div>
            <div class="form-group d-flex flex-column align-items-start mb-2">
              <label for="edit-email" class="form-label fw-semibold">Email :</label>
              <input type="email" id="edit-email" class="form-control shadow-sm border-primary" value="${this.selectedUser.email || ''}">
            </div>
            <div class="form-group d-flex flex-column align-items-start mb-2">
              <label for="edit-numTel" class="form-label fw-semibold">Téléphone :</label>
              <input type="text" id="edit-numTel" class="form-control shadow-sm border-primary" value="${this.selectedUser.numTel || ''}">
            </div>
            <div class="form-group d-flex flex-column align-items-start mb-2">
              <label for="edit-specialite" class="form-label fw-semibold">Spécialité :</label>
              <input type="text" id="edit-specialite" class="form-control shadow-sm border-primary" value="${this.selectedUser.specialite || ''}">
            </div>
          </form>
        `,
        showCancelButton: true,
        confirmButtonText: 'Mettre à jour',
        cancelButtonText: 'Annuler',
        preConfirm: () => {
          const nom = (document.getElementById('edit-nom') as HTMLInputElement).value.trim();
          const prenom = (document.getElementById('edit-prenom') as HTMLInputElement).value.trim();
          const email = (document.getElementById('edit-email') as HTMLInputElement).value.trim();
          const numTel = (document.getElementById('edit-numTel') as HTMLInputElement).value.trim();
          const specialite = (document.getElementById('edit-specialite') as HTMLInputElement).value.trim();

          if (!nom || !prenom || !email || !numTel || !specialite) {
            Swal.showValidationMessage('Tous les champs sont obligatoires');
            return null;
          }

          return { nom, prenom, email, numTel, specialite };
        }
      }).then((formResult) => {
        if (formResult.isConfirmed && formResult.value) {
          const updatedTechnicien = {
            ...this.selectedUser,
            ...formResult.value
          };

          this.authService.updateTechnicien(updatedTechnicien.id, updatedTechnicien).subscribe({
            next: () => {
              Swal.fire({
                title: 'Succès',
                text: 'Technicien mis à jour avec succès.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
              });
              this.loadUser(); // recharge la liste
              this.selectedUser = null;
            },
            error: (err) => {
              console.error('Erreur lors de la mise à jour du technicien :', err);
              Swal.fire({
                title: 'Erreur',
                text: 'Impossible de mettre à jour le technicien.',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
              });
            }
          });
        }
      });
    }
  });
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
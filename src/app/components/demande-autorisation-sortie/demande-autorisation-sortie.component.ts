import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterLink } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-demande-autorisation-sortie',
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './demande-autorisation-sortie.component.html',
  styleUrl: './demande-autorisation-sortie.component.css',
  encapsulation: ViewEncapsulation.None, 
})
export class DemandeAutorisationSortieComponent {
  autorisations: any[] = [];
  selectedAutorisation: any = null; // Autorisation sélectionnée pour modification
  currentPage: number = 1; // Page actuelle
  itemsPerPage: number = 10; // Nombre d'éléments par page
  email: string = ''; // Email du technicien pour la recherche
  isAdmin: boolean = false; // Déclarez la variable isAdmin

  constructor(private authservice: AuthService) {}
  ngOnInit(): void {
    // Vérifiez si l'utilisateur est admin
    const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    this.isAdmin = roles.includes('ROLE_ADMIN');
  
    // Charger les autorisations en fonction du rôle
    if (this.isAdmin) {
      this.loadAllAutorisations(); // Charger toutes les autorisations pour l'admin
    } else {
      this.loadAutorisationsForTechnician(); // Charger les autorisations pour le technicien
    }
  }

  loadAutorisationsForTechnician(): void {
    const emailTechnicien = sessionStorage.getItem('userEmail'); // Récupérer l'email du technicien depuis la session
    console.log('Email récupéré depuis sessionStorage :', emailTechnicien);

    if (!emailTechnicien) {
      Swal.fire('Erreur', 'Email du technicien non trouvé dans la session', 'error');
      return;
    }
  
    this.authservice.getAutorisationsByEmail(emailTechnicien).subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          this.autorisations = response.data;
        } else {
          this.autorisations = [];
          console.log('Aucune autorisation trouvée pour ce technicien.');
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des autorisations :', err);
        Swal.fire('Erreur', 'Impossible de récupérer les autorisations', 'error');
      }
    });
  }
  // Charger toutes les autorisations
  loadAllAutorisations(): void {
    this.authservice.getAllAutorisations().subscribe({
      next: (response) => {
        this.autorisations = response.data;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', 'Impossible de récupérer les autorisations', 'error');
      }
    });
  }
  isTechnician(): boolean {
    const roles = sessionStorage.getItem('roles');
    return roles ? JSON.parse(roles).includes('ROLE_TECHNICIEN') : false;
  }
  reloadAutorisations(): void {
    if (this.isAdmin) {
      this.loadAllAutorisations(); // Recharger toutes les autorisations pour l'admin
    } else {
      this.loadAutorisationsForTechnician(); // Recharger les autorisations pour le technicien
    }
  }

  editAutorisation(autorisation: any): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous modifier cette autorisation ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, modifier',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si l'utilisateur confirme, afficher le formulaire de modification
        this.selectedAutorisation = { ...autorisation }; // Cloner l'objet pour éviter les modifications directes
  
        Swal.fire({
          title: 'Modifier l\'autorisation',
          html: `
              <form id="edit-form">
                <div class="form-group d-flex flex-column align-items-start mb-3">
                  <label for="edit-dateDebut" class="form-label fw-semibold" style="color: #22325d;">Date de début :</label>
                  <input type="datetime-local" id="edit-dateDebut" class="form-control shadow-sm border-primary" value="${this.selectedAutorisation.dateDebut || ''}">
                </div>
                <div class="form-group d-flex flex-column align-items-start mb-3">
                  <label for="edit-dateFin" class="form-label fw-semibold" style="color: #22325d;">Date de fin :</label>
                  <input type="datetime-local" id="edit-dateFin" class="form-control shadow-sm border-primary" value="${this.selectedAutorisation.dateFin || ''}">
                </div>
                <div class="form-group d-flex flex-column align-items-start mb-3">
                  <label for="edit-raison" class="form-label fw-semibold" style="color: #22325d;">Raison :</label>
                  <textarea id="edit-raison" class="form-control shadow-sm border-primary" rows="3">${this.selectedAutorisation.raison || ''}</textarea>
                </div>
              </form>
            `

          ,
          showCancelButton: true,
          confirmButtonText: 'Mettre à jour',
          cancelButtonText: 'Annuler',
          preConfirm: () => {
            const dateDebut = (document.getElementById('edit-dateDebut') as HTMLInputElement).value;
            const dateFin = (document.getElementById('edit-dateFin') as HTMLInputElement).value;
            const raison = (document.getElementById('edit-raison') as HTMLTextAreaElement).value;
  
            if (!dateDebut || !dateFin || !raison) {
              Swal.showValidationMessage('Tous les champs sont obligatoires');
              return null;
            }
  
            return { dateDebut, dateFin, raison };
          }
        }).then((formResult) => {
          if (formResult.isConfirmed && formResult.value) {
            // Mettre à jour les valeurs dans l'objet sélectionné
            this.selectedAutorisation.dateDebut = formResult.value.dateDebut;
            this.selectedAutorisation.dateFin = formResult.value.dateFin;
            this.selectedAutorisation.raison = formResult.value.raison;
  
            // Appeler le service pour mettre à jour l'autorisation
            this.authservice.updateAutorisation(this.selectedAutorisation.id, this.selectedAutorisation).subscribe({
              next: () => {
                Swal.fire({
                  title: 'Succès',
                  text: 'Autorisation mise à jour avec succès.',
                  icon: 'success',
                  timer: 2000,
                  showConfirmButton: false
                });
                this.reloadAutorisations();
                this.selectedAutorisation = null; // Réinitialiser le formulaire
              },
              error: (err) => {
                console.error('Erreur lors de la mise à jour de l\'autorisation :', err);
                Swal.fire({
                  title: 'Erreur',
                  text: 'Impossible de mettre à jour l\'autorisation.',
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

  // Supprimer une autorisation
  deleteAutorisation(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action supprimera définitivement l\'autorisation.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authservice.deleteAutorisation(id).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Succès',
              text: 'Autorisation supprimée avec succès.',
              icon: 'success',
              timer: 2000, // Ferme automatiquement après 2 secondes
              showConfirmButton: false
            });
            this.reloadAutorisations();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression de l\'autorisation :', err);
            Swal.fire('Erreur', 'Impossible de supprimer l\'autorisation.', 'error');
          }
        });
      }
    });
  }
  accepterAutorisation(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action acceptera l\'autorisation.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, accepter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authservice.accepterAutorisation(id).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Succès',
              text: 'Autorisation acceptée avec succès.',
              icon: 'success',
              timer: 2000, // Ferme automatiquement après 2 secondes
              showConfirmButton: false
            });
            this.reloadAutorisations();
          },
          error: (err) => {
            console.error('Erreur lors de l\'acceptation de l\'autorisation :', err);
            Swal.fire({
              title: 'Erreur',
              text: 'Impossible d\'accepter l\'autorisation.',
              icon: 'error',
              timer: 2000, // Ferme automatiquement après 2 secondes
              showConfirmButton: false
            });
          }
        });
      }
    });
  }

  // Annuler une autorisation
  annulerAutorisation(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action annulera l\'autorisation.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authservice.annulerAutorisation(id).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Succès',
              text: 'Autorisation annulée avec succès.',
              icon: 'success',
              timer: 2000, // Ferme automatiquement après 2 secondes
              showConfirmButton: false
            });
            this.reloadAutorisations();
          },
            error: (err) => {
            console.error('Erreur lors de l\'annulation de l\'autorisation :', err);
            Swal.fire({
              title: 'Erreur',
              text: 'Impossible d\'annuler l\'autorisation.',
              icon: 'error',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  }


}
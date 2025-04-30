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
    this.selectedAutorisation = { ...autorisation }; // Cloner l'objet pour éviter les modifications directes
  }

  // Annuler la modification
  cancelEdit(): void {
    this.selectedAutorisation = null;
  }

  // Mettre à jour une autorisation
  updateAutorisation(): void {
    if (!this.selectedAutorisation) return;
  
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action mettra à jour l\'autorisation.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, mettre à jour',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authservice.updateAutorisation(this.selectedAutorisation.id, this.selectedAutorisation).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Succès',
              text: 'Autorisation mise à jour avec succès.',
              icon: 'success',
              timer: 2000, // Ferme automatiquement après 2 secondes
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
              timer: 2000, // Ferme automatiquement après 2 secondes
              showConfirmButton: false
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
              timer: 2000, // Ferme automatiquement après 2 secondes
              showConfirmButton: false
            });
          }
        });
      }
    });
  }

}
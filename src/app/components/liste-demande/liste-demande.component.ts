import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-liste-demande',
  imports: [CommonModule, FormsModule],
  templateUrl: './liste-demande.component.html',
  styleUrl: './liste-demande.component.css'
})
export class ListeDemandeComponent implements OnInit {

  demandes: any[] = [];// Un tableau qui va contenir toutes les demandes récupérées depuis le backend.
  filteredDemandes: any[] = [];//Un tableau qui contient les demandes après filtrage (affichées dans la vue)
  selectedDemande: any = { client: {} };// L'objet actuellement sélectionné pour modification.
  isUpdateMode: boolean = false;// Un booléen qui indique si l'utilisateur est en mode édition.

  filters = {
    id: '',
    idClient: '',
    entreprise:'',
    adresse: '',
    description: '',
    statut: '',
    dateDemande: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadDemandes();
  }

  loadDemandes() {
    this.authService.getDemande().subscribe({
      next: (data) => {
        this.demandes = data;
        this.filteredDemandes = data;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des demandes', error);
      }
    });
  }
  filterDemandes() {
    this.filteredDemandes = this.demandes.filter(demande =>
      (this.filters.id ? demande.id.toString().includes(this.filters.id) : true) &&
      (this.filters.idClient ? demande.client.id.toString().includes(this.filters.idClient) : true) &&
      (this.filters.entreprise ? demande.client.entreprise.toLowerCase().includes(this.filters.entreprise.toLowerCase()) : true) &&
      (this.filters.adresse ? demande.client.adresse.toLowerCase().includes(this.filters.adresse.toLowerCase()) : true) &&
      
      (this.filters.description ? demande.description.toLowerCase().includes(this.filters.description.toLowerCase()) : true) &&
      (this.filters.statut ? demande.statut.toLowerCase().includes(this.filters.statut.toLowerCase()) : true) &&
      (this.filters.dateDemande ? demande.dateDemande.toLowerCase().includes(this.filters.dateDemande.toLowerCase()) : true)
    );
  }

  

  editDemande(demande: any): void {
    // Cloner l'objet pour éviter des mutations inattendues
    this.selectedDemande = { ...demande };
  
    // Initialiser le client si non défini
    if (!this.selectedDemande.client) {
      this.selectedDemande.client = {};
    }
  
    console.log("Demande sélectionnée pour modification :", this.selectedDemande);
    this.isUpdateMode = true;
  }
  
  updateDemande(demande: any): void {
    if (!demande || !demande.id) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'ID de la demande introuvable. Impossible de procéder à la mise à jour.',
      });
      return;
    }
  
    console.log("Données envoyées au backend :", this.selectedDemande); // Ajoutez ce log
  
    Swal.fire({
      title: 'Confirmer la mise à jour',
      text: 'Êtes-vous sûr de vouloir mettre à jour cette demande ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, mettre à jour',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.updateDemande(this.selectedDemande).subscribe({
          next: (updatedDemande) => {
            const index = this.demandes.findIndex(c => c.id === updatedDemande.id);
            if (index !== -1) {
              this.demandes[index] = updatedDemande;
            }
  
            this.isUpdateMode = false;
            this.selectedDemande = null;
  
            Swal.fire({
              icon: 'success',
              title: 'Mise à jour réussie',
              text: 'La demande a été mise à jour avec succès.',
              timer: 3000,
              timerProgressBar: true
            });
            this.loadDemandes();
          },
          error: (error) => {
            console.error("Erreur lors de la mise à jour :", error); // Ajoutez ce log
            let errorMessage = 'Erreur inconnue';
            if (error.status === 404) {
              errorMessage = 'La demande n\'a pas été trouvée.';
            } else if (error.status === 400) {
              errorMessage = 'Données incorrectes envoyées au serveur.';
            } else if (error.status === 500) {
              errorMessage = 'Erreur interne du serveur.';
            }
  
            Swal.fire({
              icon: 'error',
              title: 'Erreur lors de la mise à jour',
              text: errorMessage
            });
          }
        });
      }
    });
  }
  deleteDemande(demandeId: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action supprimera définitivement la demande.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.deleteDemande(demandeId).subscribe({
          next: () => {
            Swal.fire(
              'Supprimé !',
              'La demande a été supprimée avec succès.',
              'success'
            );
            this.loadDemandes(); // Reload after deletion
          },
          error: (error) => {
            console.error('Erreur lors de la suppression de la demande', error);
            Swal.fire(
              'Erreur',
              'Une erreur est survenue lors de la suppression.',
              'error'
            );
          }
        });
      }
    });
  }
  acceptDemande(demandeId: number): void {
    this.authService.acceptDemande(demandeId).subscribe({
      next: (response) => {
        Swal.fire('Accepter!', 'la demande a été accepter.', 'success');
        this.loadDemandes(); // Reload the demandes
      },
      error: (error) => {
        Swal.fire('Error', 'erreur d"accepter la demande.', 'error');
        console.error(error);
      }
    });
  }
  
  cancelDemande(demandeId: number): void {
    this.authService.cancelDemande(demandeId).subscribe({
      next: (response) => {
        Swal.fire('Annuler!', 'la demande a été annuler.', 'success');
        this.loadDemandes(); // Reload the demandes
      },
      error: (error) => {
        Swal.fire('Error', 'erreur d"annuler la demande.', 'error');
        console.error(error);
      }
    });
  }
  
 }

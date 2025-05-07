import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterLink } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-liste-demande',
  imports: [CommonModule, FormsModule, NgxPaginationModule,RouterLink],
  templateUrl: './liste-demande.component.html',
  styleUrl: './liste-demande.component.css'
})
export class ListeDemandeComponent implements OnInit {

  demandes: any[] = [];// Un tableau qui va contenir toutes les demandes récupérées depuis le backend.
  filteredDemandes: any[] = [];//Un tableau qui contient les demandes après filtrage (affichées dans la vue)
  selectedDemande: any = { client: {} };// L'objet actuellement sélectionné pour modification.
  isUpdateMode: boolean = false;// Un booléen qui indique si l'utilisateur est en mode édition.
  currentPage: number = 1; // Page actuelle
  itemsPerPage: number = 10; 
  isClient = false;
  isAdmin = false;
  baseUrl: string = 'http://localhost:8000/uploads/demandes/';
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
    this.checkUserRole();
    this.checkUserRoleAdmin();
  }
  

  private checkUserRole(): void {
    const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    this.isClient = roles.includes('ROLE_CLIENT');
  }

  private checkUserRoleAdmin(): void {
    const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    this.isAdmin = roles.includes('ROLE_ADMIN');
  }
  loadDemandes() {
    const email = sessionStorage.getItem('userEmail');
    const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    const isClient = roles.includes('ROLE_CLIENT');
  
    this.authService.getDemandes().subscribe({
      next: (data: any[]) => {
        if (isClient && email) {
          this.demandes = data.filter(demande =>
            demande.client &&
            demande.client.email === email
          );
        } else {
          this.demandes = data;
        }
  
        this.filteredDemandes = this.demandes;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des demandes', error);
      }
    });
  }
  

  
  // getCurrentUser(): any {
  //   const userData = localStorage.getItem('user'); // ou sessionStorage
  //   return userData ? JSON.parse(userData) : null;
  // }
  
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

  

//   editDemande(demande: any): void {
//     // Cloner l'objet pour éviter des mutations inattendues
//     this.selectedDemande = { ...demande };
  
//     // Initialiser le client si non défini
//     if (!this.selectedDemande.client) {
//       this.selectedDemande.client = {};
//     }
  
//     console.log("Demande sélectionnée pour modification :", this.selectedDemande);
//     this.isUpdateMode = true;
//   }
//   cancelEdit(): void {
//     this.selectedDemande = null;
//     this.isUpdateMode = false;
//   }
//   updateDemande(demande: any): void {
//     if (this.selectedDemande) {
//     if (!demande || !demande.id) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Erreur',
//         text: 'ID de la demande introuvable. Impossible de procéder à la mise à jour.',
//       });
//       return;
//     }
  
//     console.log("Données envoyées au backend :", this.selectedDemande); // Ajoutez ce log
  
//     Swal.fire({
//       title: 'Confirmer la mise à jour',
//       text: 'Êtes-vous sûr de vouloir mettre à jour cette demande ?',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//       confirmButtonText: 'Oui, mettre à jour',
//       cancelButtonText: 'Annuler'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         this.authService.updateDemande(this.selectedDemande).subscribe({
//           next: (updatedDemande) => {
//             const index = this.demandes.findIndex(c => c.id === updatedDemande.id);
//             if (index !== -1) {
//               this.demandes[index] = updatedDemande;
//             }
  
//             this.isUpdateMode = false;
//             this.selectedDemande = null;
  
//             Swal.fire({
//               icon: 'success',
//               title: 'Mise à jour réussie',
//               text: 'La demande a été mise à jour avec succès.',
//               timer: 3000,
//               timerProgressBar: true
//             });
//             this.loadDemandes();
//           },
//           error: (error) => {
//             console.error("Erreur lors de la mise à jour :", error); // Ajoutez ce log
//             let errorMessage = 'Erreur inconnue';
//             if (error.status === 404) {
//               errorMessage = 'La demande n\'a pas été trouvée.';
//             } else if (error.status === 400) {
//               errorMessage = 'Données incorrectes envoyées au serveur.';
//             } else if (error.status === 500) {
//               errorMessage = 'Erreur interne du serveur.';
//             }
  
//             Swal.fire({
//               icon: 'error',
//               title: 'Erreur lors de la mise à jour',
//               text: errorMessage
//             });
//           }
//         });
//       }
//     });
//   }
// }
editDemande(demande: any): void {
  this.selectedDemande = { ...demande };

  Swal.fire({
    title: 'Modifier la Demande',
    html: `
      <div class="container my-4 p-4">
        <form id="update-form">
          <div class="form-group d-flex flex-column align-items-start mb-3">
            <label for="swal-input-entreprise" class="form-label fw-semibold" style="color: #22325d;">Entreprise</label>
            <input type="text" id="swal-input-entreprise" class="form-control shadow-sm border-primary" placeholder="Entreprise" value="${this.selectedDemande.client.entreprise || ''}" required>
          </div>
          <div class="form-group d-flex flex-column align-items-start mb-3">
            <label for="swal-input-adresse" class="form-label fw-semibold" style="color: #22325d;">Adresse</label>
            <input type="text" id="swal-input-adresse" class="form-control shadow-sm border-primary" placeholder="Adresse" value="${this.selectedDemande.client.adresse || ''}" required>
          </div>
          <div class="form-group d-flex flex-column align-items-start mb-3">
            <label for="swal-input-description" class="form-label fw-semibold" style="color: #22325d;">Description</label>
            <input type="text" id="swal-input-description" class="form-control shadow-sm border-primary" placeholder="Description" value="${this.selectedDemande.description || ''}" required>
          </div>
        </form>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Mettre à jour',
    cancelButtonText: 'Annuler',
    preConfirm: () => {
      const entreprise = (document.getElementById('swal-input-entreprise') as HTMLInputElement).value;
      const adresse = (document.getElementById('swal-input-adresse') as HTMLInputElement).value;
      const description = (document.getElementById('swal-input-description') as HTMLInputElement).value;

      if (!entreprise || !adresse || !description) {
        Swal.showValidationMessage('Tous les champs sont obligatoires');
        return;
      }

      return { entreprise, adresse, description };
    },
    customClass: {
      popup: 'custom-swal-popup',
      title: 'custom-swal-title',
      input: 'custom-swal-input',
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      Swal.fire({
        title: 'Confirmer la modification',
        text: 'Voulez-vous vraiment enregistrer cette modification ?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Oui, modifier',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Annuler'
      }).then((confirmResult) => {
        if (confirmResult.isConfirmed) {
          this.selectedDemande.client.entreprise = result.value.entreprise;
          this.selectedDemande.client.adresse = result.value.adresse;
          this.selectedDemande.description = result.value.description;

          this.authService.updateDemande(this.selectedDemande).subscribe({
            next: (updatedDemande) => {
              const index = this.demandes.findIndex(c => c.id === updatedDemande.id);
              if (index !== -1) {
                this.demandes[index] = updatedDemande;
              }
              Swal.fire('Succès', 'La demande a été mise à jour.', 'success');
              this.loadDemandes();
            },
            error: (error) => {
              console.error('Erreur de mise à jour:', error);
              Swal.fire('Erreur', 'Échec de la mise à jour.', 'error');
            }
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
            Swal.fire({
              icon: 'success',
              title: 'Supprimé ',
              text: 'La demande a été supprimée avec succès.',
              timer: 3000,
              timerProgressBar: true
            });
            
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
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action acceptera la demande.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, accepter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.acceptDemande(demandeId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Acceptée !',
              text: 'La demande a été acceptée avec succès.',
              timer: 3000,
              timerProgressBar: true
            });
            // Mettre à jour le statut localement
            const demande = this.demandes.find(d => d.id === demandeId);
            if (demande) {
              demande.statut = 'acceptée';
              demande.actionDateTime = new Date().toLocaleString(); // Ajouter la date et l'heure

            }
            this.loadDemandes(); 
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Une erreur s\'est produite lors de l\'acceptation de la demande.',
              confirmButtonColor: '#d33'
            });
            console.error('Erreur lors de l\'acceptation de la demande :', error);
          }
        });
      }
    });
  }
  
  cancelDemande(demandeId: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action annulera la demande.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.cancelDemande(demandeId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Annulée !',
              text: 'La demande a été annulée avec succès.',
              timer: 3000,
              timerProgressBar: true
            });
            // Mettre à jour le statut localement
            const demande = this.demandes.find(d => d.id === demandeId);
            if (demande) {
              demande.statut = 'annulée';
              demande.actionDateTime = new Date().toLocaleString(); // Ajouter la date et l'heure

            }
            this.loadDemandes(); 
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Une erreur s\'est produite lors de l\'annulation de la demande.',
              confirmButtonColor: '#d33'
            });
            console.error('Erreur lors de l\'annulation de la demande :', error);
          }
        });
      }
    });
  }
  exportToExcel(): void {
    // Préparer les données à exporter
    const dataToExport = this.filteredDemandes.map(demande => ({
      ID: demande.id,
      Entreprise: demande.client.entreprise,
      Adresse: demande.client.adresse,
      Description: demande.description,
      Statut: demande.statut,
      DateDemande: demande.dateDemande
    }));

    // Créer une feuille Excel
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Demandes');

    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Sauvegarder le fichier
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Demandes.xlsx');
  }
  printResults(): void {
    const printContent = `
      <h2 class="text-center mb-4">Liste des Demandes d'Intervention</h2>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Entreprise</th>
            <th>Adresse</th>
            <th>Description</th>
            <th>Statut</th>
            <th>Date Demande</th>
          </tr>
        </thead>
        <tbody>
          ${this.filteredDemandes.map(demande => `
            <tr>
              <td>${demande.id}</td>
              <td>${demande.client.entreprise}</td>
              <td>${demande.client.adresse}</td>
              <td>${demande.description}</td>
              <td>${demande.statut}</td>
              <td>${demande.dateDemande}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  
    const WindowPrt = window.open('', '', 'width=900,height=650');
    if (WindowPrt) {
      WindowPrt.document.write(`
        <html>
          <head>
            <title>Liste des Demandes</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
            <style>
              @page { size: auto; margin: 5mm; }
              body { padding: 20px; }
              table { width: 100%; }
            </style>
          </head>
          <body onload="window.print(); window.close()">
            ${printContent}
          </body>
        </html>
      `);
      WindowPrt.document.close();
    }
   }
 
  showDetails(demande: any): void {
    console.log('Photos:', demande.photos);

    const photosHtml = demande.photos && demande.photos.length > 0
    ? demande.photos.map((photo: string) => {
        // Vérifiez si l'URL est déjà complète
        const photoUrl = photo.startsWith('http') ? photo : `${this.baseUrl}${photo}`;
        console.log('Photo URL:', photoUrl); // Log pour vérifier les URLs corrigées
        return `<img src="${photoUrl}" alt="Photo" class="img-thumbnail m-2" style="max-width: 150px; border: 1px solid #ddd; border-radius: 5px;">`;
      }).join('')
    : '<p class="text-muted">Aucune photo disponible</p>';
    const detailsHtml = `
      <div class="text-start">
        <h5 class="mb-3"><strong>Détails de la Demande</strong></h5>
        <p><strong>ID:</strong> ${demande.id}</p>
        <p><strong>Entreprise:</strong> ${demande.client?.entreprise || '-'}</p>
        <p><strong>Adresse:</strong> ${demande.client?.adresse || '-'}</p>
        <p><strong>Description:</strong> ${demande.description || '-'}</p>
        <p><strong>Statut:</strong> <span class="badge bg-${this.getStatusColor(demande.statut)}">${demande.statut || '-'}</span></p>
        <p><strong>Date Demande:</strong> ${this.formatDate(demande.dateDemande)}</p>
        <hr>
        <h5 class="mb-3"><strong>Photos</strong></h5>
        <div class="d-flex flex-wrap">${photosHtml}</div>
      </div>
    `;
  
    // Afficher la popup SweetAlert2
    Swal.fire({
      title: `Demande #${demande.id}`,
      html: detailsHtml,
      width: '800px',
      showConfirmButton: true,
      confirmButtonText: 'Fermer',
      confirmButtonColor: '#3085d6',
      focusConfirm: false
    });
  }
  getStatusColor(statut: string): string {
    switch (statut.toLowerCase()) {
      case 'accepter':
        return 'success'; // Vert
      case 'annulee':
        return 'danger'; // Rouge
        default:case 'en_attente':
        return 'warning'; // Jaune
      
       
    }
  }
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
  
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-liste-clients',
  standalone: true,
  imports: [CommonModule,FormsModule,NgxPaginationModule],
  templateUrl: './liste-clients.component.html',
  styleUrl: './liste-clients.component.css'
})
export class ListeClientsComponent implements OnInit {
  clients: any[] = [];
  selectedClient: any = null;
  isUpdateMode: boolean = false;
  currentPage: number = 1; // Page actuelle
  itemsPerPage: number = 10; 
  filters = {
    id:'',
    nom: '',
    prenom: '',
    numTel: '',
    email: '',
    entreprise: '',
    adresse: '',
    
    
  };
   constructor( private authService: AuthService){}
   ngOnInit() {
    this.authService.getClientsWithDemande().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données', error);
      }

    });
    
  }
  ///filtre
 getFilteredClients(): any[] {
  return this.clients.filter(client =>
    (client.id.toString().includes(this.filters.id.toLowerCase())) &&
    (client.nom && client.nom.toLowerCase().includes(this.filters.nom.toLowerCase())) &&
    (client.prenom && client.prenom.toLowerCase().includes(this.filters.prenom.toLowerCase())) &&
    (client.numTel && client.numTel.toString().includes(this.filters.numTel)) &&
    (client.email && client.email.toLowerCase().includes(this.filters.email.toLowerCase())) &&
    (client.entreprise && client.entreprise.toLowerCase().includes(this.filters.entreprise.toLowerCase()))&&
    (client.adresse && client.adresse.toLowerCase().includes(this.filters.adresse.toLowerCase())) 
    
  );
}

  
//   editClient(client: any): void {
//     this.selectedClient = { ...client }; // Copier les données du client dans selectedClient pour l'édition
//     this.isUpdateMode = true; // Passer en mode édition
//   }

 

// updateClient(client: any): void {
//   if (!client || !client.id) {
//     console.error('Client ou ID du client manquant');
//     Swal.fire({
//       icon: 'error',
//       title: 'Erreur',
//       text: 'ID du client introuvable. Impossible de procéder à la mise à jour.',
//     });
//     return;
//   }

//   Swal.fire({
//     title: 'Confirmer la mise à jour',
//     text: 'Êtes-vous sûr de vouloir mettre à jour ce client ?',
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonColor: '#3085d6',
//     cancelButtonColor: '#d33',
//     confirmButtonText: 'Oui, mettre à jour',
//     cancelButtonText: 'Annuler'
//   }).then((result) => {
//     if (result.isConfirmed) {
//       this.authService.updateClient(client).subscribe(
//         (updatedClient) => {
//           console.log('Client mis à jour:', updatedClient);

//           // Mise à jour dans la liste locale
//           const index = this.clients.findIndex(c => c.id === updatedClient.id);
//           if (index !== -1) {
//             this.clients[index] = updatedClient;
//           }

//           // Réinitialiser l'UI
//           this.isUpdateMode = false;
//           this.selectedClient = {};

//           Swal.fire({
//             icon: 'success',
//             title: 'Mise à jour réussie',
//             text: 'Le client a été mis à jour avec succès.',
//             timer: 3000,
//             timerProgressBar: true
//           });
//           this.ngOnInit();
//         },
//         (error) => {
//           console.error('Erreur lors de la mise à jour du client:', error);

//           let errorMessage = 'Erreur inconnue';
//           if (error.status === 404) {
//             errorMessage = 'Le client n\'a pas été trouvé.';
//           } else if (error.status === 500) {
//             errorMessage = 'Erreur interne du serveur.';
//           }

//           Swal.fire({
//             icon: 'error',
//             title: 'Erreur lors de la mise à jour',
//             text: errorMessage
//           });
//         }
//       );
//     }
//   });
// }
editClient(client: any): void {
  Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: 'Voulez-vous modifier ce client ?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Oui, modifier',
    cancelButtonText: 'Annuler',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
  }).then((result) => {
    if (result.isConfirmed) {
      this.selectedClient = { ...client };

      Swal.fire({
        title: 'Modifier le client',
        html: `
          <form id="edit-client-form">
            <div class="form-group d-flex flex-column align-items-start mb-2">
              <label for="edit-nom" class="form-label fw-semibold text-start" style="color: #22325d;">Nom :</label>
              <input type="text" id="edit-nom" class="form-control shadow-sm border-primary" value="${this.selectedClient.nom || ''}">
            </div>
            <div class="form-group d-flex flex-column align-items-start mb-2">
              <label for="edit-prenom" class="form-label fw-semibold" style="color: #22325d;">Prénom :</label>
              <input type="text" id="edit-prenom" class="form-control shadow-sm border-primary" value="${this.selectedClient.prenom || ''}">
            </div>
            <div class="form-group d-flex flex-column align-items-start mb-2">
              <label for="edit-email" class="form-label fw-semibold" style="color: #22325d;">Email :</label>
              <input type="email" id="edit-email" class="form-control shadow-sm border-primary" value="${this.selectedClient.email || ''}">
            </div>
            <div class="form-group d-flex flex-column align-items-start mb-2">
              <label for="edit-numTel" class="form-label fw-semibold" style="color: #22325d;">Téléphone :</label>
              <input type="text" id="edit-numTel" class="form-control shadow-sm border-primary" value="${this.selectedClient.numTel || ''}">
            </div>
            <div class="form-group d-flex flex-column align-items-start mb-2">
              <label for="edit-entreprise" class="form-label fw-semibold" style="color: #22325d;">Entreprise :</label>
              <input type="text" id="edit-entreprise" class="form-control shadow-sm border-primary" value="${this.selectedClient.entreprise || ''}">
            </div>
            <div class="form-group d-flex flex-column align-items-start mb-2">
              <label for="edit-adresse" class="form-label fw-semibold" style="color: #22325d;">Adresse :</label>
              <input type="text" id="edit-adresse" class="form-control shadow-sm border-primary" value="${this.selectedClient.adresse || ''}">
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
          const entreprise = (document.getElementById('edit-entreprise') as HTMLInputElement).value.trim();
          const adresse = (document.getElementById('edit-adresse') as HTMLInputElement).value.trim();

          if (!nom || !prenom || !email || !numTel || !entreprise || !adresse) {
            Swal.showValidationMessage('Tous les champs sont obligatoires');
            return null;
          }

          return { nom, prenom, email, numTel, entreprise, adresse };
        }
      }).then((formResult) => {
        if (formResult.isConfirmed && formResult.value) {
          const updatedClient = {
            ...this.selectedClient,
            ...formResult.value
          };

          this.authService.updateClient(updatedClient).subscribe({
            next: () => {
              Swal.fire({
                title: 'Succès',
                text: 'Client mis à jour avec succès.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
              });
              this.ngOnInit(); // Remplacez par votre méthode de rafraîchissement
              this.selectedClient = null;
            },
            error: (err) => {
              console.error('Erreur lors de la mise à jour du client :', err);
              Swal.fire({
                title: 'Erreur',
                text: 'Impossible de mettre à jour le client.',
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



desactiverClient(client: any) {
  Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: 'Cette action désactivera le compte du client.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, désactiver',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      this.authService.desactiverUser(client.id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Désactivé !',
            text: 'Le compte du client a été désactivé avec succès.',
            timer: 3000,
            timerProgressBar: true
          });
          client.isActive = false; // Mettre à jour l'état localement
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur s\'est produite lors de la désactivation.',
            confirmButtonColor: '#d33'
          });
          console.error('Erreur lors de la désactivation du client :', error);
        }
      });
    }
  });
}

activerClient(client: any) {
  Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: 'Cette action activera le compte du client.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, activer',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      this.authService.activeUser(client.id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Activé !',
            text: 'Le compte du client a été activé avec succès.',
            timer: 3000,
            timerProgressBar: true
          });
          client.isActive = true; // Mettre à jour l'état localement
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur s\'est produite lors de l\'activation.',
            confirmButtonColor: '#d33'
          });
          console.error('Erreur lors de l\'activation du client :', error);
        }
      });
    }
  });
}
   

searchTerm: string = '';


    

  }

 

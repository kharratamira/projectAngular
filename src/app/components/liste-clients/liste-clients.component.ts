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

  
  editClient(client: any): void {
    this.selectedClient = { ...client }; // Copier les données du client dans selectedClient pour l'édition
    this.isUpdateMode = true; // Passer en mode édition
  }

 

updateClient(client: any): void {
  if (!client || !client.id) {
    console.error('Client ou ID du client manquant');
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'ID du client introuvable. Impossible de procéder à la mise à jour.',
    });
    return;
  }

  Swal.fire({
    title: 'Confirmer la mise à jour',
    text: 'Êtes-vous sûr de vouloir mettre à jour ce client ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, mettre à jour',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      this.authService.updateClient(client).subscribe(
        (updatedClient) => {
          console.log('Client mis à jour:', updatedClient);

          // Mise à jour dans la liste locale
          const index = this.clients.findIndex(c => c.id === updatedClient.id);
          if (index !== -1) {
            this.clients[index] = updatedClient;
          }

          // Réinitialiser l'UI
          this.isUpdateMode = false;
          this.selectedClient = {};

          Swal.fire({
            icon: 'success',
            title: 'Mise à jour réussie',
            text: 'Le client a été mis à jour avec succès.',
            timer: 3000,
            timerProgressBar: true
          });
          this.ngOnInit();
        },
        (error) => {
          console.error('Erreur lors de la mise à jour du client:', error);

          let errorMessage = 'Erreur inconnue';
          if (error.status === 404) {
            errorMessage = 'Le client n\'a pas été trouvé.';
          } else if (error.status === 500) {
            errorMessage = 'Erreur interne du serveur.';
          }

          Swal.fire({
            icon: 'error',
            title: 'Erreur lors de la mise à jour',
            text: errorMessage
          });
        }
      );
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

 

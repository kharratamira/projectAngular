import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-listedemande-contrat',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, FormsModule],
  templateUrl: './listedemande-contrat.component.html',
  styleUrls: ['./listedemande-contrat.component.css']
})
export class ListedemandeContratComponent implements OnInit {
  demandes: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  searchText: string = '';
  isAdmin: boolean = false;
  isClient: boolean = false;
  isLoading: boolean = true;
  email: string | null = null;
  role: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
     this.isAdmin = roles.includes('ROLE_ADMIN');
    const email = sessionStorage.getItem('userEmail');
    const role = roles.includes('ROLE_CLIENT') ? 'ROLE_CLIENT' : '';
    this.isClient = roles.includes('ROLE_CLIENT');

    this.loadDemandes(email, role);
  }

  // loadDemandes(email: string | null, role: string): void {
  //   this.isLoading = true;
  
  //   if (this.isAdmin) {
  //     this.authService.getDemandesContrat().subscribe({
  //       next: (response) => {
  //         this.demandes = response.data || [];
  //         this.isLoading = false;
  //       },
  //       error: () => {
  //         Swal.fire('Erreur', 'Impossible de charger les demandes', 'error');
  //         this.isLoading = false;
  //       }
  //     });
  //   } else if (email && role) {
  //     this.authService.getDemandeContratByEmail(email, role).subscribe({
  //       next: (response) => {
  //         this.demandes = response.data || [];
  //         this.isLoading = false;
  //       },
  //       error: () => {
  //         Swal.fire('Erreur', 'Impossible de charger vos demandes', 'error');
  //         this.isLoading = false;
  //       }
  //     });
  //   } else {
  //     this.isLoading = false;
  //   }
  // }
  
  loadDemandes(email: string | null, role: string): void {
    this.isLoading = true;
  
    if (this.isAdmin) {
      this.authService.getDemandesContrat().subscribe({
        next: (response) => {
          const allDemandes = response.data || [];
  
          // 🔁 Marque les demandes désactivées selon le localStorage
          allDemandes.forEach((demande: any) => {
            const isDisabled = localStorage.getItem('disabled_demande_' + demande.id) === 'true';
            demande.disabled = isDisabled;
          });
  
          this.demandes = allDemandes;
          this.isLoading = false;
        },
        error: () => {
          Swal.fire('Erreur', 'Impossible de charger les demandes', 'error');
          this.isLoading = false;
        }
      });
  
    } else if (email && role) {
      this.authService.getDemandeContratByEmail(email, role).subscribe({
        next: (response) => {
          const userDemandes = response.data || [];
  
          // 🔁 Marque les demandes désactivées selon le localStorage
          userDemandes.forEach((demande: any) => {
            const isDisabled = localStorage.getItem('disabled_demande_' + demande.id) === 'true';
            demande.disabled = isDisabled;
          });
  
          this.demandes = userDemandes;
          this.isLoading = false;
        },
        error: () => {
          Swal.fire('Erreur', 'Impossible de charger vos demandes', 'error');
          this.isLoading = false;
        }
      });
  
    } else {
      this.isLoading = false;
    }
  }
  
  get filteredDemandes() {
    return this.demandes.filter(demande =>
      demande.description?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      demande.client?.entreprise?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      demande.statut?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
   acceptDemandeContrat(demandeId: number): void {
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
          this.authService.acceptDemandeContrat(demandeId).subscribe({
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
              this.loadDemandes(this.email, this.role); 
              
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
    
    cancelDemandeContrat(demandeId: number): void {
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
          this.authService.cancelDemandeContrat(demandeId).subscribe({
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
                demande.statut = 'annulee'; // sans accent
                demande.dateAction = new Date().toLocaleString(); // Ajouter la date et l'heure
  
              }
                this.loadDemandes(this.email, this.role); 

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
    editDemandeContrat(demandeContrat: any): void {
      if (demandeContrat.statut === 'en_attente') {
        Swal.fire({
          title: `Modifier demande contart #${demandeContrat.id}`,
          html: `
            <div class="text-start">
              <label for="description" class="form-label">Description</label>
              <textarea id="description" class="form-control">${demandeContrat.description || ''}</textarea>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Modifier',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Annuler',
          preConfirm: () => {
            const description = (document.getElementById('description') as HTMLTextAreaElement).value;
            return { description };
          }
        }).then((result) => {
          if (result.isConfirmed) {
            const { description } = result.value!;
            
            // ✅ Demander confirmation avant d'enregistrer
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
                this.authService.updateDemandeContrat(demandeContrat.id, { description }).subscribe({
                  next: (response) => {
                    if (response.status === 'success') {
                      Swal.fire({
                        icon: 'success',
                        title: 'Succès',
                        text: 'Intervention mise à jour avec succès.',
                        timer: 2000,
                        timerProgressBar: true,
                        didClose: () => {
                          this.loadDemandes(sessionStorage.getItem('userEmail'), this.isClient ? 'ROLE_CLIENT' : '');
                        }
                      });
                    } else {
                      Swal.fire('Erreur', response.message, 'error');
                    }
                  },
                  error: () => {
                    Swal.fire('Erreur', 'Une erreur est survenue lors de la mise à jour.', 'error');
                  }
                });
              }
            });
          }
        });
      }
    }
    disableRow(demande: any): void {
      demande.disabled = true;
      localStorage.setItem('disabled_demande_' + demande.id, 'true');
    }
    
  }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Importez FormsModule
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-liste-intervention',
  standalone: true,
  imports: [CommonModule,NgxPaginationModule,
    FormsModule],
  templateUrl: './liste-intervention.component.html',
  styleUrls: ['./liste-intervention.component.css']
})
export class ListeInterventionComponent implements OnInit {
  interventions: any[] = [];
  filteredInterventions: any[] = [];
  currentPage: number = 1; // Page actuelle
  itemsPerPage: number = 10; 

  isAdmin: boolean = false;
  isLoading: boolean = true;
  filterInterventionId: string = '';
  filterDemandeId: string = '';
  filterClient: string = '';
  filterTechnicien: string = '';
  filterDescription: string = '';
  filterDateDebut: string = '';
  filterDateFin: string = '';


  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    this.isAdmin = roles.includes('ROLE_ADMIN');
    this.loadInterventions();
  }

  loadInterventions(): void {
    this.isLoading = true;
    
    if (this.isAdmin) {
      this.authService.getAllInterventions().subscribe({
        next: (response) => {
          this.interventions = response.data || [];
          this.filteredInterventions = this.interventions; // Initialisation des données filtrées

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else {
      const userEmail = sessionStorage.getItem('userEmail');
      if (userEmail) {
        this.authService.getClientInterventions(userEmail).subscribe({
          next: (response) => {
            this.interventions = response.data || [];
            this.filteredInterventions = this.interventions; // Initialisation des données filtrées

            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      } else {
        this.isLoading = false;
      }
    }
  }
  applyFilters(): void {
    this.filteredInterventions = this.interventions.filter((intervention) => {
      const matchesInterventionId = intervention.intervention_id
        ? intervention.intervention_id.toString().includes(this.filterInterventionId.toLowerCase())
        : true; // Si `intervention_id` est undefined, on considère qu'il correspond
  
      const matchesDemandeId = intervention.demande?.id
        ? intervention.demande.id.toString().includes(this.filterDemandeId.toLowerCase())
        : true; // Si `demande_id` est undefined, on considère qu'il correspond
  
      const matchesClient = intervention.client?.entreprise
        ?.toLowerCase()
        .includes(this.filterClient.toLowerCase());
  
      const matchesTechnicien = intervention.technicien?.prenom
        ?.toLowerCase()
        .includes(this.filterTechnicien.toLowerCase());
  
      const matchesDateDebut = this.formatDate(intervention.affectation_date_prevu)
        .toLowerCase()
        .includes(this.filterDateDebut.toLowerCase());
  
      const matchesDateFin = this.formatDate(intervention.date_fin)
        .toLowerCase()
        .includes(this.filterDateFin.toLowerCase());
  
      return (
        matchesInterventionId &&
        matchesDemandeId &&
        matchesClient &&
        matchesTechnicien &&
        matchesDateDebut &&
        matchesDateFin
      );
    });
  }
  showTachesPopup(intervention: any): void {
    // Préparer le HTML pour les tâches
    let tasksHtml = '<div class="text-start">';
    
    if (intervention.taches && intervention.taches.length > 0) {
      tasksHtml += `
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Tâche</th>
              <th class="text-end">Prix</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      intervention.taches.forEach((tache: any) => {
        tasksHtml += `
          <tr>
            <td>${tache.tache}</td>
            <td class="text-end">${tache.prix} DT</td>
          </tr>
        `;
      });
      
      tasksHtml += `
          <tr class="table-active fw-bold">
            <td>Total</td>
            <td class="text-end">${this.calculateTotal(intervention.taches)} €</td>
          </tr>
        </tbody>
        </table>
      `;
    } else {
      tasksHtml += '<p class="text-muted">Aucune tâche enregistrée</p>';
    }
    
    tasksHtml += '</div>';

    // Afficher la popup SweetAlert2
    Swal.fire({
      title: `Tâches - Intervention #${intervention.intervention_id}`,
      html: `
        <div class="text-start mb-3">
          <p><strong>Client:</strong> ${intervention.client.entreprise}&nbsp;&nbsp;  <strong>Responsable:</strong>  ${intervention.client?.prenom} ${intervention.client?.nom}</p>
          <p><strong>Technicien:</strong> ${intervention.technicien?.prenom} ${intervention.technicien?.nom}</p>
 <p><strong>Date Debut:</strong> ${this.formatDate(intervention.affectation_date_prevu)}&nbsp;&nbsp;
        <strong>Date fin:</strong> ${this.formatDate(intervention.date_fin)}</p>        </div>
        ${tasksHtml}
      `,
      width: '600px',
      showConfirmButton: true,
      confirmButtonText: 'Fermer',
      confirmButtonColor: '#3085d6',
      focusConfirm: false
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  calculateTotal(taches: any[]): number {
    return taches?.reduce((total, tache) => total + (tache.prix || 0), 0) || 0;
  }
}
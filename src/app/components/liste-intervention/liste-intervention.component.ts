
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-liste-intervention',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, FormsModule],
  templateUrl: './liste-intervention.component.html',
  styleUrls: ['./liste-intervention.component.css']
})
export class ListeInterventionComponent implements OnInit {
  interventions: any[] = [];
  filteredInterventions: any[] = [];
  currentPage: number = 1; // Page actuelle
  itemsPerPage: number = 10; // Nombre d'éléments par page

  isAdmin: boolean = false;
  isLoading: boolean = true;

  // Filtres
  filterInterventionId: string = '';
  filterDemandeId: string = '';
  filterClient: string = '';
  filterTechnicien: string = '';
  filterDescription: string = '';
  filterDateDebut: string = '';
  filterDateFin: string = '';
  isTechnicien: boolean = false; // Vérifie si l'utilisateur est un technicien

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    this.isAdmin = roles.includes('ROLE_ADMIN');
    const email = sessionStorage.getItem('userEmail');
    const role = roles.includes('ROLE_CLIENT') ? 'ROLE_CLIENT' : 'ROLE_TECHNICIEN';
    this.isTechnicien = roles.includes('ROLE_TECHNICIEN'); // Vérifie si l'utilisateur a le rôle de technicien

    this.loadInterventions(email, role);
  }

  loadInterventions(email: string | null, role: string): void {
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
    } else if (email) {
      this.authService.getInterventionsByEmail(email, role).subscribe({
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

  applyFilters(): void {
    this.filteredInterventions = this.interventions.filter((intervention) => {
      const matchesInterventionId = intervention.intervention_id
        ? intervention.intervention_id.toString().includes(this.filterInterventionId.toLowerCase())
        : true;

      const matchesDemandeId = intervention.demande?.id
        ? intervention.demande.id.toString().includes(this.filterDemandeId.toLowerCase())
        : true;

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
            <td class="text-end">${this.calculateTotal(intervention.taches)} DT</td>
          </tr>
        </tbody>
        </table>
      `;
    } else {
      tasksHtml += '<p class="text-muted">Aucune tâche enregistrée</p>';
    }

    tasksHtml += '</div>';

    Swal.fire({
      title: `Tâches - Intervention #${intervention.intervention_id}`,
      html: `
        <div class="text-start mb-3">
          <p><strong>Client:</strong> ${intervention.client.entreprise}&nbsp;&nbsp;  <strong>Responsable:</strong>  ${intervention.client?.prenom} ${intervention.client?.nom}</p>
          <p><strong>Technicien:</strong> ${intervention.technicien?.prenom} ${intervention.technicien?.nom}</p>
          <p><strong>Date Début:</strong> ${this.formatDate(intervention.affectation_date_prevu)}&nbsp;&nbsp;
          <strong>Date Fin:</strong> ${this.formatDate(intervention.date_fin)}</p>
        </div>
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
  loadAllTaches(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.authService.getTaches().subscribe({
        next: (response) => {
          resolve(response.data || []);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }
  editIntervention(intervention: any): void {
    this.loadAllTaches().then((tachesDisponibles) => {
      // Générer les checkboxes pour toutes les tâches disponibles
      const tachesCheckboxes = tachesDisponibles.map((tache: any) => `
        <div class="form-check">
          <input 
            class="form-check-input" 
            type="checkbox" 
            id="tache-${tache.id}" 
            value="${tache.id}" 
            ${intervention.taches.some((t: any) => t.id === tache.id) ? 'checked' : ''}>
          <label class="form-check-label" for="tache-${tache.id}">
            ${tache.tache} (${tache.prix} DT)
          </label>
        </div>
      `).join('');

      Swal.fire({
        title: `Modifier l'Intervention #${intervention.intervention_id}`,
        html: `
          <div class="text-start">
            <label for="observation" class="form-label">Observation</label>
            <textarea id="observation" class="form-control">${intervention.observation || ''}</textarea>
            <label for="taches" class="form-label mt-3">Tâches</label>
            <div id="taches-container">
              ${tachesCheckboxes}
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Enregistrer',
        cancelButtonText: 'Annuler',
        preConfirm: () => {
          const observation = (document.getElementById('observation') as HTMLTextAreaElement).value;
          const taches = Array.from(document.querySelectorAll('#taches-container .form-check-input:checked'))
            .map((checkbox: any) => parseInt(checkbox.value, 10));
          return { observation, taches };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const { observation, taches } = result.value!;
          this.authService.updateIntervention(intervention.intervention_id, { observation, taches }).subscribe({
            next: (response) => {
              if (response.status === 'success') {
                Swal.fire('Succès', 'Intervention mise à jour avec succès.', 'success');
                this.loadInterventions(sessionStorage.getItem('userEmail'), this.isAdmin ? 'ROLE_ADMIN' : 'ROLE_TECHNICIEN');
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
    }).catch((err) => {
      Swal.fire('Erreur', 'Impossible de charger les tâches : ' + err, 'error');
    });
  }
}
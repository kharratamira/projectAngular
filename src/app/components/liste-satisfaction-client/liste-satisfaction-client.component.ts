// src/app/components/liste-satisfaction-client/liste-satisfaction-client.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // pour *ngIf, *ngFor
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NgxPaginationModule } from 'ngx-pagination'; // Pagination
import Swal from 'sweetalert2';

@Component({
  selector: 'app-liste-satisfaction-client',
  standalone: true,
  templateUrl: './liste-satisfaction-client.component.html',
  styleUrls: ['./liste-satisfaction-client.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class ListeSatisfactionClientComponent implements OnInit {
  satisfaction: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  searchText: string = '';
  isLoading: boolean = true;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.fetchSatisfaction();
  }

  fetchSatisfaction(): void {
    this.authService.getAllSatisfaction().subscribe({
      next: (res) => {
        this.satisfaction = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des satisfactions', err);
        this.isLoading = false;
      }
    });
  }

  get filteredSatisfaction() {
    const search = this.searchText.toLowerCase();
    return this.satisfaction.filter(item =>
      item.intervention.client.nom.toLowerCase().includes(search) ||
      item.intervention.client.prenom.toLowerCase().includes(search) ||
      item.intervention.client.entreprise.toLowerCase().includes(search) ||
      item.intervention.client.email.toLowerCase().includes(search) ||
     item.intervention.observation?.toLowerCase().includes(search)||
      item.satisfaction.niveau.toLowerCase().includes(search) ||
      item.satisfaction.commentaire?.toLowerCase().includes(search) ||
      item.satisfaction.date_creation?.toLowerCase().includes(search)
    );
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
          <td class="text-end">${tache.prix?.toFixed(2) || '0.00'} DT</td>
        </tr>
      `;
    });

    tasksHtml += `
        <tr class="table-active fw-bold">
          <td>Total</td>
          <td class="text-end">${this.calculateTotal(intervention.taches).toFixed(2)} DT</td>
        </tr>
        </tbody>
      </table>
    `;
  } else {
    tasksHtml += '<p class="text-muted">Aucune tâche enregistrée</p>';
  }

  tasksHtml += '</div>';

  Swal.fire({
    title: ` Intervention #${intervention.id}`,
    html: `
      <div class="text-start mb-3">
        <p><strong>Client:</strong> ${intervention.client.entreprise} &nbsp;&nbsp;
        <strong>Responsable:</strong> ${intervention.client.prenom} ${intervention.client.nom}</p>

        <p><strong>Date Début:</strong> ${this.formatDate(intervention.affectation.date_prevu)} &nbsp;&nbsp;
        <strong>Date Fin:</strong> ${this.formatDate(intervention.date_fin)}</p>

        <p><strong>Technicien:</strong> ${intervention.technicien.prenom} ${intervention.technicien.nom}&nbsp;&nbsp;
        <strong>Spécialité:</strong> ${intervention.technicien.specialite} </p>

        <p><strong>Observation:</strong> ${intervention.observation || 'N/A'}</p>
      </div>
      ${tasksHtml}
    `,
    width: '650px',
    showConfirmButton: true,
    confirmButtonText: 'Fermer',
    confirmButtonColor: '#3085d6'
  });
}

calculateTotal(taches: any[]): number {
  return taches.reduce((sum, t) => sum + (t.prix || 0), 0);
}

formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
}

}

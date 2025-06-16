import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-liste-facture',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './liste-facture.component.html',
  styleUrl: './liste-facture.component.css'
})
export class ListeFactureComponent implements OnInit {
  factures: any[] = [];
  filteredFacture: any[] = [];
  isClient = false;

  isLoading = true;
  isAdmin = false;
  searchText = '';
  currentPage = 1;
  itemsPerPage = 10;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    this.isAdmin = roles.includes('ROLE_ADMIN');
    const email = sessionStorage.getItem('userEmail') || '';
    this.isClient = roles.includes('ROLE_CLIENT');

    this.loadFactures(email);
  }

  loadFactures(email: string): void {
    this.isLoading = true;

    const request$ = this.isAdmin
      ? this.authService.getAllFactures()
      : this.authService.getFacturesByClient(email);

    request$.subscribe({
      next: (res) => {
        this.factures = res.data || [];
        // this.filteredFacture = this.factures;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Erreur', 'Impossible de charger les factures', 'error');
      }
    });
  }

 get filteredFacturesPaginated(): any[] {
  const search = this.searchText.toLowerCase();
  return this.factures.filter(f =>
    f.numFacture?.toLowerCase().includes(search) ||
    f.intervention?.nom?.toLowerCase().includes(search) ||
    f.intervention?.prenom?.toLowerCase().includes(search) ||
    f.intervention?.entreprise?.toLowerCase().includes(search) ||
    f.statut?.toLowerCase().includes(search)
  );
}

htmlContent: string = ''; // Pour stocker le contenu à imprimer

afficherFacture(facture: any): void {
  const tachesHtml = (facture.intervention?.taches || []).map((t: any) => `
    <tr>
      <td>${t.tache}</td>
      <td>${t.prixTache?.toFixed(2)} DT</td>
    </tr>
  `).join('');

  const contenuFacture = `
    <div style="text-align:left; font-size:14px; padding:20px;">
      <h3 style="text-align:center;">Facture #${facture.numFacture}</h3>
      <p><strong>Date émission :</strong> ${facture.dateEmission}</p>
      <p><strong>Date échéance :</strong> ${facture.dateEcheance}</p>

      <p><strong>Client :</strong> ${facture.intervention?.prenom} ${facture.intervention?.nom} &nbsp;&nbsp;
       <strong>Entreprise</strong> ${facture.intervention?.entreprise}</p>

      <hr />
      <table style="width:100%; border-collapse: collapse;" border="1">
        <thead>
          <tr style="background-color:#f2f2f2;">
            <th style="padding: 8px;">Tâche</th>
            <th style="padding: 8px;">Prix (DT)</th>
          </tr>
        </thead>
        <tbody>
          ${tachesHtml || '<tr><td colspan="2">Aucune tâche</td></tr>'}
        </tbody>
      </table>

      <br />
      <p><strong>Montant HTVA :</strong> ${facture.montantHTVA} DT</p>
      <p><strong>TVA (20%) :</strong> ${facture.tva} DT</p>
      <p><strong>Remise :</strong> ${facture.remise}%</p>
      <p><strong>Total TTC :</strong> ${facture.montantTTC} DT</p>
    </div>
  `;

  // Stocker dans la propriété pour impression
  this.htmlContent = contenuFacture;

  Swal.fire({
    html: contenuFacture,
    width: 800,
    showCloseButton: true,
    confirmButtonText: 'Fermer',
    showDenyButton: true,
    denyButtonText: '🖨️ Imprimer',
    preDeny: () => this.printFacture()
  });
}
printFacture(): void {
  const windowPrt = window.open('', '', 'width=900,height=650');
  if (windowPrt) {
    windowPrt.document.write(`
      <html>
        <head>
          <title>Impression Facture</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close()">
          ${this.htmlContent}
        </body>
      </html>
    `);
    windowPrt.document.close();
  } else {
    alert("La fenêtre d'impression a été bloquée par le navigateur.");
  }
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
          <td class="text-end">${tache.prixTache?.toFixed(2) || '0.00'} DT</td>
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
    title: `Intervention #${intervention.id}`,
    html: `
      <div class="text-start mb-3">
        <p><strong>Client:</strong> ${intervention.entreprise} &nbsp;&nbsp;
        <strong>Responsable:</strong> ${intervention.prenom} ${intervention.nom}</p>
       
        <p><strong>Date Début:</strong> ${this.formatDate(intervention.datePrevu)} &nbsp;&nbsp;
        <strong>Date Fin:</strong> ${this.formatDate(intervention.dateFin)}</p>
         <p><strong>Technicien:</strong> ${intervention.prenomTechnicien} ${intervention.nomTechnicien}&nbsp;&nbsp;
         <strong>Specialite:</strong> ${intervention.specialite} </p>
        
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
  return taches.reduce((sum, t) => sum + (t.prixTache || 0), 0);
}

formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
}

ouvrirPopupPaiement(facture: any): void {
   if (facture.statut === 'Payée' || facture.statut === 'payé') {
    Swal.fire({
      icon: 'info',
      title: 'Paiement déjà effectué',
      text: `La facture #${facture.numFacture} est déjà marquée comme payée.`,
      timer: 2500,
      showConfirmButton: false
    });
    return;
  }
  this.authService.getAllModesPaiement().subscribe({
    next: (res) => {
      const modes = res.data || [];

      Swal.fire({
        title: `Modes de paiement pour la facture #${facture.numFacture}`,
        html: `
          <div style="text-align: left;">
            ${modes.map((mode: any) => `
              <div>
                <input type="checkbox" id="mode-${mode.id}" value="${mode.id}" class="swal-mode-checkbox"/>
                <label for="mode-${mode.id}">${mode.modePaiement}</label>
              </div>
            `).join('')}
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Enregistrer',
        cancelButtonText: 'Annuler',
        preConfirm: () => {
          const selected: number[] = [];
          document.querySelectorAll('.swal-mode-checkbox:checked').forEach((el: any) => {
            selected.push(parseInt(el.value, 10));
          });

          if (selected.length === 0 || selected.length > 2) {
            Swal.showValidationMessage('Veuillez sélectionner 1 ou 2 modes de paiement.');
            return false;
          }

          return selected;
        }
      }).then(result => {
        if (result.isConfirmed && result.value) {
          this.authService.setModesPaiement(facture.id, result.value).subscribe({
            next: () => {
              // Recharger les factures après un paiement réussi
              const email = sessionStorage.getItem('userEmail') || '';
              this.loadFactures(email);
              
              Swal.fire('Succès', 'Modes de paiement enregistrés avec succès.', 'success');
            },
            error: () => {
              Swal.fire('Erreur', 'Échec de l"enregistrement des modes de paiement.', 'error');
            }
          });
        }
      });
    },
    error: () => {
      Swal.fire('Erreur', 'Impossible de charger les modes de paiement.', 'error');
    }
  });
}

getNomModesPaiement(modes: any[]): string {
  return modes.map(m => m.nom).join(', ');
}
validerPaiement(facture: any) {
    Swal.fire({
      title: 'Confirmer le paiement',
      text: `Voulez-vous vraiment marquer la facture #${facture.numFacture} comme payée ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, valider',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.validerPaiement(facture.id).subscribe({
          next: (response: any) => {
            if (response.success) {
              // Mettre à jour la facture localement
              facture.statut = 'Payée';
              facture.date_paiement = response.date_paiement;
              
              Swal.fire(
                'Validé !',
                'La facture a été marquée comme payée.',
                'success'
              );
            } else {
              Swal.fire(
                'Erreur',
                response.message || 'Erreur lors de la validation',
                'error'
              );
            }
          },
          error: (err) => {
            Swal.fire(
              'Erreur',
              err.error?.message || 'Une erreur est survenue',
              'error'
            );
          }
        });
      }
    });
  }
}

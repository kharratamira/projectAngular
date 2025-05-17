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
        this.filteredFacture = this.factures;
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
    return this.filteredFacture.filter(f =>
      f.numFacture?.toLowerCase().includes(search) ||
      f.client?.nom?.toLowerCase().includes(search) ||
      f.client?.prenom?.toLowerCase().includes(search) ||
      f.client?.entreprise?.toLowerCase().includes(search) ||
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

      <p><strong>Client :</strong> ${facture.client?.prenom} ${facture.client?.nom} - ${facture.client?.entreprise}</p>

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

ouvrirPopupPaiement(facture: any): void {
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

}
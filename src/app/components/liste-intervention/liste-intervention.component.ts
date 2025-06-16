
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
  searchText: string = '';
  baseUrl: string = 'http://localhost:8000/uploads/demandes/';

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
          this.interventions = (response.data || []).map((interv: any) => {
            return {
              ...interv,
              hasFacture: interv.facture != null // 👈 ajoute une propriété booléenne
            };
          });
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



  get filteredIntervention() {
    const search = this.searchText.toLowerCase();

    return this.interventions.filter(intervention =>
      intervention.intervention_id.toString().includes(search) ||
      intervention.client?.entreprise?.toLowerCase().includes(search) ||
      intervention.client?.prenom?.toLowerCase().includes(search) ||
      intervention.client?.nom?.toLowerCase().includes(search) ||
      intervention.technicien?.prenom?.toLowerCase().includes(search) ||
      intervention.technicien?.nom?.toLowerCase().includes(search) ||
      intervention.demande?.description?.toLowerCase().includes(search) ||
      this.formatDate(intervention.affectation_date_prevu).toLowerCase().includes(search) ||
      this.formatDate(intervention.date_fin).toLowerCase().includes(search)
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
             ${!this.isTechnicien ? '<th class="text-end">Prix</th>' : ''}

            </tr>
          </thead>
          <tbody>
      `;

      intervention.taches.forEach((tache: any) => {
        tasksHtml += `
          <tr>
            <td>${tache.tache}</td>
             ${!this.isTechnicien ? `<td class="text-end">${tache.prix} DT</td>` : ''}
          </tr>
        `;
      });

      if (!this.isTechnicien) {
        tasksHtml += `
        <tr class="table-active fw-bold">
          <td>Total</td>
          <td class="text-end">${this.calculateTotal(intervention.taches)} DT</td>
        </tr>
      `;
      }

      tasksHtml += `
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
          <strong>Observation:</strong> ${intervention.observation}</p>


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
    const today = new Date();
    const dateFin = new Date(intervention.date_fin);

    const isSameDay =
      today.getFullYear() === dateFin.getFullYear() &&
      today.getMonth() === dateFin.getMonth() &&
      today.getDate() === dateFin.getDate();

    if (!isSameDay) {
      Swal.fire(
        'Modification non autorisée',
        'Vous ne pouvez modifier cette intervention que le jour où elle a été terminée.',
        'warning'
      );
      return;
    }

    this.loadAllTaches().then((tachesDisponibles) => {
      // 🔁 Corrigé : Vérifie par nom de tâche
      const tachesCheckboxes = tachesDisponibles.map((tache: any) => {
        const isChecked = intervention.taches.some((t: any) => t.tache === tache.tache);
        return `
        <div class="form-check">
          <input 
            class="form-check-input" 
            type="checkbox" 
            id="tache-${tache.id}" 
            value="${tache.id}" 
            ${isChecked ? 'checked' : ''}>
          <label class="form-check-label" for="tache-${tache.id}">
            ${tache.tache}
          </label>
        </div>
      `;
      }).join('');

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

  genererFacturePopup(intervention: any): void {
    const dateEmission = new Date();
    const dateEcheance = new Date();
    dateEcheance.setDate(dateEmission.getDate() + 30);

    this.authService.previewFacture(intervention.intervention_id).subscribe({
      next: (facture) => {
        const montantHTVA = facture.intervention.taches.reduce((total: number, t: any) => total + t.prixTache, 0);
        const TVA = Math.round(montantHTVA * 19) / 100; // TVA à 19%
        const montantTTC = Math.round((montantHTVA + TVA) * 100) / 100;
        const tachesHtml = facture.intervention.taches.map((t: any) => `
        <tr>
          <td>${t.tache}</td>
          <td>${t.prixTache.toFixed(2)} DT</td>
        </tr>
      `).join('');

        const htmlContent = `
        <div style="text-align:left; font-size:14px">
          <p><strong>Facture #prévisualisation</strong></p>
          <p><strong>Date émission :</strong> ${dateEmission.toLocaleDateString()}</p>
          <p><strong>Date échéance :</strong> ${dateEcheance.toLocaleDateString()}</p>

          <p><strong>Client :</strong> ${intervention.client.nom} ${intervention.client.prenom} - ${intervention.client.entreprise}</p>

          <hr />
          <table class="table table-bordered" style="width:100%">
            <thead><tr><th>Tâche</th><th>Prix (DT)</th></tr></thead>
            <tbody>${tachesHtml}</tbody>
          </table>

         <p><strong>Montant HTVA :</strong> ${montantHTVA.toFixed(2)} DT</p>
          <p><strong>TVA (19%) :</strong> ${TVA.toFixed(2)} DT</p>
          <p><strong>Total TTC :</strong> ${montantTTC.toFixed(2)} DT</p>
          <label for="remise">Ajouter une remise (%) :</label>
          <input type="number" id="remise" class="swal2-input" value="0" min="0" max="100" />
        </div>
      `;

        Swal.fire({
          title: `Facture intervention #${intervention.intervention_id}`,
          html: htmlContent,
          showCancelButton: true,
          confirmButtonText: 'Enregistrer la facture',
          cancelButtonText: 'Annuler',
          width: 700,
          preConfirm: () => {
            const remise = parseFloat((document.getElementById('remise') as HTMLInputElement).value);
            if (isNaN(remise) || remise < 0 || remise > 100) {
              Swal.showValidationMessage('Remise invalide. Entrez un chiffre entre 0 et 100');
              return;
            }

            return this.authService.genererFacture(intervention.intervention_id, remise).toPromise()
              .then(res => {
                return res;
              }).catch(err => {
                Swal.showValidationMessage('Erreur lors de la création de la facture');
                throw err;
              });
          }
        }).then(result => {
          if (result.isConfirmed) {
            Swal.fire({
              icon: 'success',
              title: 'Facture enregistrée',
              text: `Numéro : ${result.value.numFacture}`,
              timer: 2000,
              showConfirmButton: false
            });

            // Rechargement de la page après la fermeture de l'alerte
            window.location.reload();
          }
        });
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de prévisualiser la facture', 'error');
      }
    });
  }
  showDetails(demande: any): void {

    const detailsHtml = `
    <div class="text-start">
      
      <h5 class="mb-3"><strong>Détails de la Demande</strong></h5>

      <p><strong>Description:</strong> ${demande.description || '-'}</p>
      <p><strong>Statut:</strong> <span class="badge bg-primary">${demande.statut || '-'}</span></p>
      <p><strong>Date Demande:</strong> ${this.formatDate(demande.dateDemande) || '-'}</p>
      
      <hr>
      
      <h5 class="mb-3"><strong>Photos</strong></h5>
      <div class="d-flex flex-wrap">
        ${demande.photos && demande.photos.length > 0
        ? demande.photos.map((photo: string) => `
              <img src="${photo.startsWith('http') ? photo : this.baseUrl + photo}" 
                   alt="Photo" 
                   class="img-thumbnail m-2" 
                   style="max-width: 150px;">
            `).join('')
        : '<p class="text-muted">Aucune photo disponible</p>'
      }
      </div>
    </div>
  `; console.log(demande);


    Swal.fire({
      title: ` Demande #${demande.id}`,
      html: detailsHtml,
      width: '800px',
      showConfirmButton: true,
      confirmButtonText: 'Fermer'
    });
  }
  htmlContent: string = ''; // Pour stocker le contenu à imprimer

  afficherFacture(facture: any, intervention: any): void {
    const client = intervention?.client || facture.intervention?.client;
    const taches = intervention?.taches || facture.intervention?.taches || [];
    //const remise = facture.remise || 0; // Pourcentage de remise

    if (!client) {
      console.error('Données client manquantes');
      Swal.fire('Erreur', 'Données client non disponibles', 'error');
      return;
    }
    const tachesHtml = taches.map((t: any) => `
    <tr>
      <td style="padding: 8px;">${t.tache || 'Non spécifié'}</td>
      <td style="padding: 8px; text-align: right;">${(t.prix || 0).toFixed(2)} DT</td>
    </tr>
  `).join('');

    const contenuFacture = `
    <div style="text-align:left; font-size:14px; padding:20px;">
      <h3 style="text-align:center;">Facture #${facture.numFacture}</h3>
      <p><strong>Date émission :</strong> ${facture.dateEmission}</p>
      <p><strong>Date échéance :</strong> ${facture.dateEcheance}</p>

      <p><strong>Client :</strong> ${client.prenom || ''} ${client.nom || '-'} -  ${client.entreprise || '-'}</p>
<div style="text-align: left;">
            <p><strong>Statut:</strong> ${facture.statut || 'N/A'}  </span></p>
          </div>
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
      <p><strong>TVA (19%) :</strong> ${facture.TVA} DT</p>
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

  openSatisfactionPopup(intervention: any): void {
    if (!intervention.date_fin) {
      Swal.fire('Information', 'Vous pouvez évaluer l’intervention une fois qu’elle est terminée.', 'info');
      return;
    }

    const htmlForm = `
    <form id="satisfaction-form" class="text-start">
      <div class="mb-4">
        <label class="form-label fw-bold">Niveau de satisfaction :</label><br>

        <div class="form-check form-check-inline">
          <input type="radio" class="form-check-input" name="niveau" value="Très satisfait" id="tresSatisfait">
          <label class="form-check-label" for="tresSatisfait">Très satisfait</label>
        </div>

        <div class="form-check form-check-inline">
          <input type="radio" class="form-check-input" name="niveau" value="Satisfait" id="satisfait">
          <label class="form-check-label" for="satisfait">Satisfait</label>
        </div>

        <div class="form-check form-check-inline">
          <input type="radio" class="form-check-input" name="niveau" value="Peu satisfait" id="peuSatisfait">
          <label class="form-check-label" for="peuSatisfait">Peu satisfait</label>
        </div>

        <div class="form-check form-check-inline">
          <input type="radio" class="form-check-input" name="niveau" value="Pas du tout satisfait" id="pasSatisfait">
          <label class="form-check-label" for="pasSatisfait">Pas du tout satisfait</label>
        </div>
      </div>

      <div class="mb-4">
        <label for="commentaire" class="form-label fw-bold">Commentaire :</label>
        <textarea id="commentaire" class="form-control" rows="3" placeholder="Votre commentaire (facultatif)"></textarea>
      </div>
    </form>
  `;

    Swal.fire({
      title: `<h4 class="text-primary">Évaluation de l'intervention #${intervention.intervention_id}</h4>`,
      html: htmlForm,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: '<i class="bi bi-send-fill me-1"></i> Envoyer',
      cancelButtonText: '<i class="bi bi-x-circle me-1"></i> Annuler',
      customClass: {
        popup: 'text-start',
        confirmButton: 'btn btn-success px-4',
        cancelButton: 'btn btn-outline-secondary me-2',
      },
      width: '700px',
      preConfirm: () => {
        const selectedRadio = document.querySelector('input[name="niveau"]:checked') as HTMLInputElement;
        const commentaire = (document.getElementById('commentaire') as HTMLTextAreaElement).value;

        if (!selectedRadio) {
          Swal.showValidationMessage('Veuillez sélectionner un niveau de satisfaction.');
          return false;
        }

        return { niveau: selectedRadio.value, commentaire };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const payload = {
          niveau: result.value.niveau,
          commentaire: result.value.commentaire,
          intervention_id: intervention.intervention_id
        };

        this.authService.satisfactionClient(payload).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Merci !',
              text: 'Votre avis a été enregistré avec succès.',
              timer: 2500,
              timerProgressBar: true,
              showConfirmButton: false,

            });
            window.location.reload();

          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Une erreur est survenue lors de l’enregistrement.',
              timer: 2500,
              timerProgressBar: true,
              showConfirmButton: false
            });
          }
        });
      }
    });
  }

}
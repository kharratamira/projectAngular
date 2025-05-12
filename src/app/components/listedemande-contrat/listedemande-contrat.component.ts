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
    console.log('EMAIL:', this.email); // 👈 à vérifier dans la console
  console.log('ROLE:', this.role);

    this.isClient = roles.includes('ROLE_CLIENT');

    this.loadDemandes(email, role);
  }
  loadDemandes(email: string | null, role: string): void {
  this.isLoading = true;

  const ajouterContratNum = (demandes: any[]) => {
    demandes.forEach((demande: any) => {
      const isDisabled = localStorage.getItem('disabled_demande_' + demande.id) === 'true';
      demande.disabled = isDisabled;

      // 🔁 Récupère le numéro du contrat si déjà généré
      if (demande.isGenere) {
        this.authService.getContratByDemande(demande.id).subscribe({
          next: (res: any) => {
            demande.contratNum = res.contrat.num;
          },
          error: () => {
            console.warn(`Contrat introuvable pour la demande #${demande.id}`);
          }
        });
      }
    });
  };

  if (this.isAdmin) {
    this.authService.getDemandesContrat().subscribe({
      next: (response) => {
        const allDemandes = response.data || [];
        ajouterContratNum(allDemandes);
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
        ajouterContratNum(userDemandes);
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
      demande.id.toString().includes(this.searchText) ||
      demande.description?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      demande.client?.entreprise?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      demande.client?.nom?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      demande.client?.prenom?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      demande.dateDemande?.toLowerCase().includes(this.searchText.toLowerCase()) ||
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
                text: 'La demande contrat a été acceptée avec succès.',
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
                text: 'Une erreur s\'est produite lors de l\'acceptation de la demande contrat.',
                confirmButtonColor: '#d33'
              });
              console.error('Erreur lors de l\'acceptation de la demande contrat :', error);
            }
          });
        }
      });
    }
    
    cancelDemandeContrat(demandeId: number): void {
      Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: 'Cette action annulera la demande contart.',
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
                text: 'La demande de contrat a été annulée avec succès.',
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
                text: 'Une erreur s\'est produite lors de l\'annulation de la demande contrat.',
                confirmButtonColor: '#d33'
              });
              console.error('Erreur lors de l\'annulation de la demande contrat :', error);
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
    afficherCreatContratPopup(demande: any): void {
      console.log('Détails de la demande:', demande); // Ajoutez ce log
  console.log('Client:', demande.client);
  const dateDebut = new Date();

  const dateFin = new Date();
  dateFin.setFullYear(dateFin.getFullYear() + 1);

  const contenuContrat = `
    <div style="text-align: left; font-size: 14px;">
      <p><strong>CONTRAT D’ENTRETIEN</strong></p>
      <p><strong>ENTRE</strong><br>
      La société MTD Groupe Ayant son siège Social à l’avenue de Liberté Av. de Carthage, Imm. Ribat el Madian 4e étage App. 405, Rte Gremda, Sfax 3027,  désignée ci-après par l’Entrepreneur.</p>

      <p><strong>ET</strong><br>
      <strong>${demande.client.nom} ${demande.client.prenom}</strong>, représentant l’entreprise <strong>${demande.client.entreprise}</strong>,<br>
      sise à ${demande.client.adresse}.</p>
      <p>D’autre part.</p>
      <p><strong>Il a été convenu ce qui suit :</strong></p>

      <p><strong>ARTICLE 1 : OBJET</strong><br>
      <p>Le <strong>${demande.client.nom} ${demande.client.prenom}</strong> confie à l’Entrepreneur les travaux d’entretien de :</p>
       01 ascenseur électrique 450kg – 3 stops – 1.0m/s...</p>
       <p>Installés dans  l’immeuble «${demande.client.entreprise}» sis  ${demande.client.adresse}</p>
      <p/> Le présent contrat a pour objet de fixer les conditions relatives à l’entretien de cet ascenseur.</p>
      <p><strong>ARTICLE 2 : <p><strong>ARTICLE 4 : DURÉE</strong><br></strong><br>
      <p>2-1 : Entretien Préventif</p>
      <ul>
      <li>Nettoyage des treuils</li>
      <li>Vérification des niveaux d’huile</li>
      <li>Vérification des connexions électriques</li>
      <li>Nettoyage des tableaux de manœuvre</li>
      <li>Vérification de l’état des contacts et relais</li>
      <li>Nettoyage et graissage des guides</li>
      <li>Vérification de l’état des câbles électriques (pendentif)</li>
      <li>Vérification de l’état des câbles de traction</li>
      <li>Graissage des rails supérieurs</li>
      <li>Vérification des sécurités mécaniques et électriques des portes palières</li>
      <li>Vérification des boutons d’arrêt d’urgence</li>
      <li>Vérification des afficheurs dans la cabine et aux paliers</li>
      <li>Vérification des défauts enregistrés dans la mémoire des élévateurs</li>
      <li>vérification et réglage du nivelage</li>
      <li>Vérification du parachute 1 fois par a</li>
      <li>Vérification des capteurs de position haute et basse 1 fois tous les 5 ans </li>
      </ul>
      <p>N.B : Pour cet ascenseur, la durée d’exécution des opérations demandées pour cet entretien préventif ne peut être inférieure
       à<strong> une demi- journée tous SIX mois soit 2 visites par un </strong>.
       <br>
       Les visites d’entretien préventif seront effectuées par les agents l’Entrepreneur,
       en avisant le responsable désigné par LE SYNDIC DE ${demande.client.entreprise}. Un bon à deux volets,
        mentionnant la date et la nature d’intervention sera signé par l’agent l’Entrepreneur et le responsable
        désigné par LE SYNDIC DE ${demande.client.entreprise}La copie signée lui sera remise.
        <br>
         <p>2-2 : Appel d’urgence</p>
        <p>Sur appel du responsable désigné par le client ${demande.client.entreprise}, 
        l’Entrepreneur s’engage à dépêcher ses techniciens sur place dans un délai maximal de 24 h,
         afin de procéder à tout dépannage et remettre les élévateurs en fonctionnement.
         <br>
        Le délai de réparation sera fixé par l’Entrepreneur selon la complexité de la panne.</p>
         <p><strong>ARTICLE 3 : FACTURATION</strong><br>
         <p>3 :1 le montant du présent contrat et arrêté à la somme de : QUATRE CENT CINQUANTE Dinars Hors TVA  (450 DT HT).
         <br>
          3 :2 Ce montant sera payé sur présentation de mémoire d’honoraires -100 % la signature du contrat<br>
          3 :3 Le non payement de l’honoraire d’entretien engendre la suspension de toute intervention et l’Entrepreneur se dégage de toute responsabilité.<br>
          3 :4 Le montant annuel de ce contrat d’entretien sera révisé annuellement avec une majoration de 5% sur le montant hors T.V.A.</p>


      <p><strong>ARTICLE 4 : DURÉE</strong><br>
      La durée du présent contrat d’entretien est fixée à une année et ce à partir 
      Du <strong>${dateDebut.toLocaleDateString()}</strong> au <strong>${dateFin.toLocaleDateString()}</strong></p>
      Elle sera renouvelable d’année en année par tacite reconduction sauf dénonciation par le [client]. Dans ce cas, 
      le  [client] avisera l’Entrepreneur par lettre recommandée avant trois mois de la date limite de l’expiration du contrat d’entretien en cours.<br>
      <p><strong>ARTICLE 5 : FOURNITURE DES PIECES DE RECHANGE</strong><br>
      L’Entrepreneur s’engage à assurer l’approvisionnement en pièces de rechange pendant une durée minimale de dix ans.<br>
      Faute de quoi, l’Entrepreneur sera obligé de remplacer à ses frais la pièce défectueuse par un équipement neuf dans 
      un délai de trois mois à partir de la commande de réparation notifiée par le syndic de cet immeuble.<br>
      <p><strong>ARTICLE 6 : EXCLUSIONS</strong><br>
      5.1 Le Présent contrat exclut le remplacement des pièces de toutes natures usées ou détériorées ainsi que les travaux et déplacements y afférents.<br>
      5 :2 Ne sont pas couvertes par le contrat d’entretien les réparations d’avaries causées par fausses manœuvres ou intervention étrangères aux techniciens de l’Entrepreneur.<br>
      5 :3 Les salles des machines devront être toujours fermées à clé et l’accès seront interdits à toute personne étrangère au service.<br>
      5 :4 L’intervention sur les équipements et les locaux des élévateurs par une personne étrange à l’Entrepreneur engendre le dégagement de toute responsabilité de ce dernier.<br>
      Dans ces locaux, il n’est pas permis le stockage de matériaux étrangers à l’élévateur<br>
      <p><strong>ARTICLE 7 : LITIGE</strong><br>
      Pour tous litiges ou différents portant sur l’interprétation ou l’inobservation des clauses du présent contrat,
       les deux parties d’en remettront exclusivement à la juridiction des tribunaux de Tunis.<br>
      <p><strong>ARTICLE 8 : TIMBRAGE ET ENREGISTREMENT</strong><br>
      Les frais de timbre et d’enregistrement du présent contrat sont à la charge de la partie qui la demande.<br><br>
         Fait à Sfax Le, ${dateDebut.toLocaleDateString()}<br><br>
        <div style="display: flex; justify-content: space-between; margin-top: 50px;">
  <div>
    <strong>LU ET ACCEPTE PAR L’ENTREPRENEUR</strong><br>
    <strong>MTD GROUPE</strong>
  </div>
  <div style="text-align: right;">
    <strong>VU ET APPROUVE PAR</strong><br>
    <strong>${demande.client.nom} ${demande.client.prenom} de chez ${demande.client.entreprise}</strong>
  </div>
</div>


      <!-- Tu peux insérer les autres articles ici -->
    </div>
  `;

  Swal.fire({
    title: `Contrat de demande #${demande.id}`,
    html: contenuContrat,
    showCancelButton: true,
    confirmButtonText: 'Enregistrer le contrat',
    cancelButtonText: 'Annuler',
    width: 800,
    preConfirm: () => {
      return this.authService.createContrat(demande.id).toPromise()
        .then(response => {
           const num = response.contrat.num;
          const demandeLocal = this.demandes.find(d => d.id === response.demandeId);
          if (demandeLocal) {
            demandeLocal.statut = `Contrat #${num}`;
          }
           setTimeout(() => {
            window.location.reload(); // Recharge la page
          }, 1500); // Délai de 1.5s avant recharge
          
          return response;
        })
        .catch(error => {
          Swal.showValidationMessage('Erreur lors de l\'enregistrement du contrat');
          throw error;
        });
    }
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Succès',
        text: 'Contrat enregistré avec succès. Actualisation en cours...',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false
      });
    }
  });
}
contratHtml: string = '';
    voirContrat(demandeId: number): void {
  this.authService.getContratByDemande(demandeId).subscribe({
    next: (response: any) => {
      const { contrat, client } = response;
const contenuContrat = `
    <div style="text-align: left; font-size: 14px;">
      <p><strong>CONTRAT D’ENTRETIEN</strong></p>
      <p><strong>ENTRE</strong><br>
      La société MTD Groupe Ayant son siège Social à l’avenue de Liberté Av. de Carthage, Imm. Ribat el Madian 4e étage App. 405, Rte Gremda, Sfax 3027,  désignée ci-après par l’Entrepreneur.</p>

      <p><strong>ET</strong><br>
      <strong>${client.nom} ${client.prenom}</strong>, représentant l’entreprise <strong>${client.entreprise}</strong>,<br>
      sise à${client.adresse}.</p>
      <p>D’autre part.</p>
      <p><strong>Il a été convenu ce qui suit :</strong></p>

      <p><strong>ARTICLE 1 : OBJET</strong><br>
      <p>Le <strong>${client.nom} ${client.prenom}</strong> confie à l’Entrepreneur les travaux d’entretien de :</p>
       01 ascenseur électrique 450kg – 3 stops – 1.0m/s...</p>
       <p>Installés dans  l’immeuble «${client.entreprise}» sis  ${client.adresse}</p>
      <p/> Le présent contrat a pour objet de fixer les conditions relatives à l’entretien de cet ascenseur.</p>
      <p><strong>ARTICLE 2 : <p><strong>ARTICLE 4 : DURÉE</strong><br></strong><br>
      <p>2-1 : Entretien Préventif</p>
      <ul>
      <li>Nettoyage des treuils</li>
      <li>Vérification des niveaux d’huile</li>
      <li>Vérification des connexions électriques</li>
      <li>Nettoyage des tableaux de manœuvre</li>
      <li>Vérification de l’état des contacts et relais</li>
      <li>Nettoyage et graissage des guides</li>
      <li>Vérification de l’état des câbles électriques (pendentif)</li>
      <li>Vérification de l’état des câbles de traction</li>
      <li>Graissage des rails supérieurs</li>
      <li>Vérification des sécurités mécaniques et électriques des portes palières</li>
      <li>Vérification des boutons d’arrêt d’urgence</li>
      <li>Vérification des afficheurs dans la cabine et aux paliers</li>
      <li>Vérification des défauts enregistrés dans la mémoire des élévateurs</li>
      <li>vérification et réglage du nivelage</li>
      <li>Vérification du parachute 1 fois par a</li>
      <li>Vérification des capteurs de position haute et basse 1 fois tous les 5 ans </li>
      </ul>
      <p>N.B : Pour cet ascenseur, la durée d’exécution des opérations demandées pour cet entretien préventif ne peut être inférieure
       à<strong> une demi- journée tous SIX mois soit 2 visites par un </strong>.
       <br>
       Les visites d’entretien préventif seront effectuées par les agents l’Entrepreneur,
       en avisant le responsable désigné par LE SYNDIC DE${client.entreprise}. Un bon à deux volets,
        mentionnant la date et la nature d’intervention sera signé par l’agent l’Entrepreneur et le responsable
        désigné par LE SYNDIC DE ${client.entreprise}La copie signée lui sera remise.
        <br>
         <p>2-2 : Appel d’urgence</p>
        <p>Sur appel du responsable désigné par le client${client.entreprise}, 
        l’Entrepreneur s’engage à dépêcher ses techniciens sur place dans un délai maximal de 24 h,
         afin de procéder à tout dépannage et remettre les élévateurs en fonctionnement.
         <br>
        Le délai de réparation sera fixé par l’Entrepreneur selon la complexité de la panne.</p>
         <p><strong>ARTICLE 3 : FACTURATION</strong><br>
         <p>3 :1 le montant du présent contrat et arrêté à la somme de : QUATRE CENT CINQUANTE Dinars Hors TVA  (450 DT HT).
         <br>
          3 :2 Ce montant sera payé sur présentation de mémoire d’honoraires -100 % la signature du contrat<br>
          3 :3 Le non payement de l’honoraire d’entretien engendre la suspension de toute intervention et l’Entrepreneur se dégage de toute responsabilité.<br>
          3 :4 Le montant annuel de ce contrat d’entretien sera révisé annuellement avec une majoration de 5% sur le montant hors T.V.A.</p>


      <p><strong>ARTICLE 4 : DURÉE</strong><br>
      La durée du présent contrat d’entretien est fixée à une année et ce à partir 
      Du <strong>${contrat.dateDebut}</strong> au <strong>${contrat.dateFin}</strong></p>
      Elle sera renouvelable d’année en année par tacite reconduction sauf dénonciation par le [client]. Dans ce cas, 
      le  [client] avisera l’Entrepreneur par lettre recommandée avant trois mois de la date limite de l’expiration du contrat d’entretien en cours.<br>
      <p><strong>ARTICLE 5 : FOURNITURE DES PIECES DE RECHANGE</strong><br>
      L’Entrepreneur s’engage à assurer l’approvisionnement en pièces de rechange pendant une durée minimale de dix ans.<br>
      Faute de quoi, l’Entrepreneur sera obligé de remplacer à ses frais la pièce défectueuse par un équipement neuf dans 
      un délai de trois mois à partir de la commande de réparation notifiée par le syndic de cet immeuble.<br>
      <p><strong>ARTICLE 6 : EXCLUSIONS</strong><br>
      5.1 Le Présent contrat exclut le remplacement des pièces de toutes natures usées ou détériorées ainsi que les travaux et déplacements y afférents.<br>
      5 :2 Ne sont pas couvertes par le contrat d’entretien les réparations d’avaries causées par fausses manœuvres ou intervention étrangères aux techniciens de l’Entrepreneur.<br>
      5 :3 Les salles des machines devront être toujours fermées à clé et l’accès seront interdits à toute personne étrangère au service.<br>
      5 :4 L’intervention sur les équipements et les locaux des élévateurs par une personne étrange à l’Entrepreneur engendre le dégagement de toute responsabilité de ce dernier.<br>
      Dans ces locaux, il n’est pas permis le stockage de matériaux étrangers à l’élévateur<br>
      <p><strong>ARTICLE 7 : LITIGE</strong><br>
      Pour tous litiges ou différents portant sur l’interprétation ou l’inobservation des clauses du présent contrat,
       les deux parties d’en remettront exclusivement à la juridiction des tribunaux de Tunis.<br>
      <p><strong>ARTICLE 8 : TIMBRAGE ET ENREGISTREMENT</strong><br>
      Les frais de timbre et d’enregistrement du présent contrat sont à la charge de la partie qui la demande.<br><br>
         Fait à Sfax Le, ${contrat.dateDebut}<br><br>
        <div style="display: flex; justify-content: space-between; margin-top: 50px;">
  <div>
    <strong>LU ET ACCEPTE PAR L’ENTREPRENEUR</strong><br>
    <strong>MTD GROUPE</strong>
  </div>
  <div style="text-align: right;">
    <strong>VU ET APPROUVE PAR</strong><br>
    <strong>${client.nom} ${client.prenom}de chez ${client.entreprise}</strong>
  </div>
</div>


      <!-- Tu peux insérer les autres articles ici -->
    </div>
  `;
   this.contratHtml = contenuContrat;
      Swal.fire({
        title: `Contrat #${contrat.num}`,
        html: contenuContrat,
        showCloseButton: true,
        
        confirmButtonText: 'Fermer',
         showDenyButton: true, // Ajoute le bouton secondaire
        denyButtonText: 'Imprimer', // Texte du bouton secondaire
        width: 800,
        preDeny: () => this.printContrat()
 
      });
    },
    error: () => {
      Swal.fire('Erreur', 'Impossible de charger le contrat.', 'error');
    }
  });
}
printContrat(): void {
  const WindowPrt = window.open('', '', 'width=900,height=650');
  if (WindowPrt) {
    WindowPrt.document.write(`
      <html>
        <head>
          <title>Impression Contrat</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body onload="window.print(); window.close()">
          ${this.contratHtml}
        </body>
      </html>
    `);
    WindowPrt.document.close();
  } else {
    alert("La fenêtre d'impression a été bloquée par le navigateur.");
  }
}
accepterContrat(contratId: number): void {
  this.authService.acceptContrat(contratId).subscribe({
    next: () => {
      Swal.fire({
        icon: 'success',
        title: 'Contrat accepté avec succès.',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        console.log(this.email, this.role);
         this.loadDemandes(sessionStorage.getItem('userEmail'), this.isClient ? 'ROLE_CLIENT' : '');
    });
    },
    error: () => {
      Swal.fire('Erreur', 'Échec lors de l’acceptation du contrat.', 'error');
    }
  });
}

annulerContrat(contratId: number): void {
  this.authService.cancelContrat(contratId).subscribe({
    next: () => {
      Swal.fire({
        icon: 'success',
        title: 'Contrat annulé avec succès.',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {

         this.loadDemandes(sessionStorage.getItem('userEmail'), this.isClient ? 'ROLE_CLIENT' : '');
         
      });
    },
    error: () => {
      Swal.fire('Erreur', 'Échec lors de l’annulation du contrat.', 'error');
    }
  });
}
}
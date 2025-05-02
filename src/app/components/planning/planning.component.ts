import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarOptions } from '@fullcalendar/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [FullCalendarModule, CommonModule, RouterModule],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css']
})
export class PlanningComponent implements OnInit {
  public affectations: any[] = [];
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth'
    },
    // nowIndicator: true,
    // slotMinTime: '08:00:00',
    // slotMaxTime: '20:00:00',
    // slotDuration: '00:30:00',
    // displayEventTime: true,
    // eventTimeFormat: {
    //   hour: '2-digit',
    //   minute: '2-digit',
    //   hour12: false
    
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventContent: this.customEventContent.bind(this),
    eventDisplay: 'block',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadAffectations();
  }

 
  customEventContent(arg: any) {
    const eventDate = new Date(arg.event.start);
    const formattedTime = eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const status = arg.event.extendedProps.status;
    const statusColor = this.getStatusColor(status);

    return {
      html: `
        <div class="fc-event-container">
          <div class="event-time">${formattedTime}</div>
          <div class="event-title">${arg.event.title}</div>
          <div class="event-status" style="background-color: ${statusColor}; color: white; padding: 2px 4px; border-radius: 3px;">
            ${this.getStatusText(status)}
          </div>
        </div>
      `
    };
  }
  

  getStatusText(status: string): string {
    switch(status) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      case 'autorisation': return 'Autorisation';

      default: return status;
    }
  }
  // handleEventClick(info: any): void {
  //   const event = info.event;
  //   const eventDate = new Date(event.start);
  //   const statut = event.extendedProps.status;
  
  //   if (statut === 'en_cours') {
      
  //     this.authService.getTaches().subscribe({
  //       next: (response) => {
  //         const taches = response.data || [];
  
  //         const checkboxHtml = taches.map((t: any, index: number) =>
  //           `<div style="margin-bottom: 5px;">
  //              <input type="checkbox" id="tache-${index}" name="tache" value="${t.id}" />
  //              <label for="tache-${index}">${t.tache} </label>
  //            </div>`
  //         ).join('');
  
  //         Swal.fire({
  //           title: `Détails de l'affectation #${event.extendedProps.demandeId || 'N/A'}`,
  //           html: `
  //               <div style="text-align: left;">
  //                   <p><b>Technicien:</b> ${event.extendedProps.technicien}</p>
  //                   <p><b>Statut:</b> <span style="color: ${this.getStatusColor(statut)}">
  //                       ${this.getStatusText(statut)}
  //                   </span></p>
  //                   <p><b>Date:</b> ${eventDate.toLocaleDateString('fr-FR')}</p>
  //                   <p><b>Heure:</b> ${eventDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
  //                   <p><b>Description:</b> ${event.extendedProps.description || 'Aucune description'}</p>
  //                   <hr />
  //                   <p><b>Tâches intervention :</b></p>
  //                   ${checkboxHtml}
  //               </div>
  //           `,
  //           confirmButtonText: 'Fermer',
  //           confirmButtonColor: '#3085d6',
  //           width: '600px'
  //         });
  //       },
  //       error: (err) => {
  //         console.error('Erreur lors de la récupération des tâches', err);
  //         Swal.fire('Erreur', 'Impossible de récupérer les tâches.', 'error');
  //       }
  //     });
  //   } else {
  //     Swal.fire({
  //       title: `Détails de l'affectation #${event.extendedProps.demandeId || 'N/A'}`,
  //       html: `
  //           <div style="text-align: left;">
  //               <p><b>Technicien:</b> ${event.extendedProps.technicien}</p>
  //               <p><b>Statut:</b> <span style="color: ${this.getStatusColor(statut)}">
  //                   ${this.getStatusText(statut)}
  //               </span></p>
  //               <p><b>Date:</b> ${eventDate.toLocaleDateString('fr-FR')}</p>
  //               <p><b>Heure:</b> ${eventDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
  //               <p><b>Description:</b> ${event.extendedProps.description || 'Aucune description'}</p>
  //           </div>
  //       `,
  //       showDenyButton: statut === 'en_attente',
  //       denyButtonText: 'En cours',
  //       confirmButtonText: 'Fermer',
  //       confirmButtonColor: '#3085d6',
  //       denyButtonColor: '#007bff',
  //       width: '600px'
  //     }).then((result) => {
  //       if (result.isDenied) {
  //         const affectationId = event.id;
  
  //         this.authService.updateStatutEnCours(affectationId).subscribe({
  //           next: () => {
  //             Swal.fire('Statut mis à jour en "en cours" !', '', 'success');
  //             this.loadAffectations(); // Refresh the calendar
  //           },
  //           error: (err) => {
  //             Swal.fire('Erreur', 'Impossible de mettre à jour le statut.', 'error');
  //             console.error(err);
  //           }
  //         });
  //       }
  //     });
  //   }
  // }
  
  handleEventClick(info: any): void {
    const event = info.event;
    const eventDate = new Date(event.start);
    const statut = event.extendedProps.status;

    if (statut === 'en_attente') {
      Swal.fire({
        title: `Détails de l'affectation #${event.extendedProps.demandeId || 'N/A'}`,
        html: `
          <div style="text-align: left;">
            <p><b>Technicien:</b> ${event.extendedProps.technicien}</p>
            <p><b>Statut:</b> <span style="color: ${this.getStatusColor(statut)}">
              ${this.getStatusText(statut)}
            </span></p>
            <p><b>Date:</b> ${eventDate.toLocaleDateString('fr-FR')}</p>
            <p><b>Heure:</b> ${eventDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
            <p><b>Description:</b> ${event.extendedProps.description || 'Aucune description'}</p>
          </div>
        `,
        showDenyButton: true,
        denyButtonText: 'En cours',
        confirmButtonText: 'Fermer',
        confirmButtonColor: '#3085d6',
        denyButtonColor: '#007bff',
        width: '600px'
      }).then((result) => {
        if (result.isDenied) {
          const affectationId = event.id;

          this.authService.updateStatutEnCours(affectationId).subscribe({
            next: () => {
              Swal.fire('Statut mis à jour en "en cours" !', '', 'success');
              this.loadAffectations(); // Rafraîchir le calendrier
            },
            error: (err) => {
              Swal.fire('Erreur', 'Impossible de mettre à jour le statut.', 'error');
              console.error(err);
            }
          });
        }
      });
    } else if (statut === 'en_cours') {
      this.authService.getTaches().subscribe({
        next: (response) => {
          const taches = response.data || [];

          const checkboxHtml = taches.map((t: any, index: number) =>
            `<div class="form-check">
               <input class="form-check-input" type="checkbox" id="tache-${index}" name="tache" value="${t.id}" />
               <label class="form-check-label" for="tache-${index}">
                 ${t.tache}
               </label>
             </div>`
          ).join('');
          Swal.fire({
            title: `Détails de l'affectation #${event.extendedProps.demandeId || 'N/A'}`,
            html: `
                <div style="text-align: left;">
                    <p><b>Technicien:</b> ${event.extendedProps.technicien}</p>
                    <p><b>Statut:</b> <span style="color: ${this.getStatusColor(statut)}">
                        ${this.getStatusText(statut)}
                    </span></p>
                    <p><b>Date:</b> ${eventDate.toLocaleDateString('fr-FR')}</p>
                    <p><b>Heure:</b> ${eventDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                    <p><b>Description:</b> ${event.extendedProps.description || 'Aucune description'}</p>
                    <hr />
                    <p><b>Tâches intervention :</b></p>
                    ${checkboxHtml}
                    <p><b>Observation :</b></p>
                  <textarea id="observation-input" rows="4" style="width: 100%; resize: vertical;" placeholder="Ajouter une observation..."></textarea>
                </div>
            `,
            showCancelButton: true,
            cancelButtonText: 'Fermer',
            confirmButtonText: 'Enregistrer l’intervention',
            confirmButtonColor: '#28a745',
            width: '600px'
          }).then((result) => {
            if (result.isConfirmed) {
              const checkedTacheIds = Array.from(document.querySelectorAll('input[name="tache"]:checked'))
                .map((el: any) => el.value);

              const data = {
                affectation_id: event.id,
                taches: checkedTacheIds.map((id: string) => parseInt(id)),
                observation: (document.getElementById('observation-input') as HTMLTextAreaElement)?.value || ''
              };

              console.log('Payload intervention:', data);
              this.authService.createIntervention(data).subscribe({
                next: () => {
                  Swal.fire('Intervention enregistrée !', '', 'success');
                  this.loadAffectations();
                },
                error: (err) => {
                  console.error('Erreur lors de la création de l’intervention', err);
                  Swal.fire('Erreur', 'Impossible de créer l’intervention.', 'error');
                }
              });
            }
          });
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des tâches', err);
          Swal.fire('Erreur', 'Impossible de récupérer les tâches.', 'error');
        }
      });
    } else {
      Swal.fire({
        title: `Détails de l'affectation #${event.extendedProps.demandeId || 'N/A'}`,
        html: `
            <div style="text-align: left;">
                <p><b>Technicien:</b> ${event.extendedProps.technicien}</p>
                <p><b>Statut:</b> <span style="color: ${this.getStatusColor(statut)}">
                    ${this.getStatusText(statut)}
                </span></p>
                <p><b>Date:</b> ${eventDate.toLocaleDateString('fr-FR')}</p>
                <p><b>Heure:</b> ${eventDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                <p><b>Description:</b> ${event.extendedProps.description || 'Aucune description'}</p>
            </div>
        `,
        confirmButtonText: 'Fermer',
        confirmButtonColor: '#3085d6',
        width: '600px'
      });
    }
  }
 
  
  loadAffectations(): void {
    const email = this.getCurrentUserEmail();
    const isTechnicien = this.isTechnicien();

    if (!email || !isTechnicien) {
      console.log("Utilisateur non autorisé");
      return;
    }

    this.authService.getAffectationsForTechnicien(email).subscribe({
      next: (data: any) => {
        const events: any[] = [];
  
        // 🔵 Affectations
        for (const aff of data.affectations) {
          events.push({
            id: aff.id,
            title: `#${aff.demande_id} - ${aff.technicien_nom} ${aff.technicien_prenom}`,
            start: aff.datePrevu,
            extendedProps: {
              demandeId: aff.demande_id,
              technicien: `${aff.technicien_nom} ${aff.technicien_prenom}`,
              status: aff.statutAffectation
            },
            color: this.getStatusColor(aff.statutAffectation),
            allDay: false
          });
        }
  
        // 🔴 Autorisations de sortie
        for (const auth of data.autorisations) {
          console.log("Autorisation", auth.dateDebut, auth.dateFin);

          events.push({
            title: `Autorisation: ${auth.raison}`,
            start: new Date(auth.dateDebut),
            end: new Date(auth.dateFin),
            color: '#dc3545', // rouge
            allDay: false,
            extendedProps: {
              status: 'autorisation',
              description: auth.raison
            }
          });
        }
  
        this.calendarOptions.events = events;
        this.calendarOptions = { ...this.calendarOptions };
      },
      error: (error) => {
        console.error("Erreur:", error);
      }
    });
  }
  // ... (keep existing getStatusColor, getCurrentUserEmail, getCurrentUserRoles, isTechnicien methods)


  getStatusColor(status: string): string {
    if (status === 'en_attente') {
      return '#FFA500';
    }
    switch(status) {
      case 'en_cours': return '#2196F3';
      case 'terminee': return '#077a0c';
      default: return '#9E9E9E';
    }
  }

  getCurrentUserEmail(): string | null {
    return sessionStorage.getItem('userEmail');
  }

  getCurrentUserRoles(): string[] {
    return JSON.parse(sessionStorage.getItem('roles') || '[]');
  }

  isTechnicien(): boolean {
    return this.getCurrentUserRoles().includes('ROLE_TECHNICIEN');
  }
}
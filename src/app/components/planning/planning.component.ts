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
      default: return status;
    }
  }

  handleEventClick(info: any): void {
    const event = info.event;
    const eventDate = new Date(event.start);
    
    Swal.fire({
        title: `Détails de l'affectation #${event.extendedProps.demandeId || 'N/A'}`,
        html: `
            <div style="text-align: left;">
                <p><b>Technicien:</b> ${event.extendedProps.technicien}</p>
                <p><b>Statut:</b> <span style="color: ${this.getStatusColor(event.extendedProps.status)}">
                    ${event.extendedProps.status}
                </span></p>
                <p><b>Date:</b> ${eventDate.toLocaleDateString('fr-FR')}</p>
                <p><b>Heure:</b> ${eventDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                <p><b>Description:</b> ${event.extendedProps.description || 'Aucune description'}</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Fermer',
        confirmButtonColor: '#3085d6',
        width: '600px'
    });
}

  loadAffectations(): void {
    const email = this.getCurrentUserEmail();
    const isTechnicien = this.isTechnicien();

    if (!email || !isTechnicien) {
      console.log("Utilisateur non autorisé");
      return;
    }

    this.authService.getAffectationsForTechnicien(email).subscribe({
      next: (data: any[]) => {
        this.affectations = data;
        this.updateCalendarEvents();
      },
      error: (error) => {
        console.error("Erreur:", error);
      }
    });}
  
    updateCalendarEvents(): void {
      this.calendarOptions.events = this.affectations.map(aff => ({
        id: aff.id,
        title: `#${aff.demande?.id} - ${aff.technicien?.nom} ${aff.technicien?.prenom}`,
        start: aff.datePrevu,
        extendedProps: {
          demandeId: aff.demande?.id,
          description: aff.demande?.description,
          technicien: `${aff.technicien?.nom} ${aff.technicien?.prenom}`,
          status: aff.statutAffectation
        },
        color: this.getStatusColor(aff.statutAffectation),
        allDay: false
      }));
  
      this.calendarOptions = {...this.calendarOptions};
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
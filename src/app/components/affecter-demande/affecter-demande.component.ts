import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarOptions } from '@fullcalendar/core';

@Component({
  selector: 'app-affecter-demande',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './affecter-demande.component.html',
  styleUrls: ['./affecter-demande.component.css']
})
export class AffecterDemandeComponent implements OnInit {
  techniciens: any[] = [];
  datesPrevues: any[] = [];
  autorisations: any[] = [];
specialites: string[] = [];
selectedSpecialite: string = '';

  affectation = {
    demande_id: 0,
    technicien_id: 0,
    date_prevu: '',
    date_affectation: ''
  };

  isLoading = true;
  demandeId!: number;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.demandeId = +this.route.snapshot.params['id'];
    this.affectation.demande_id = this.demandeId;
    this.loadTechniciens();
      this.loadAllAffectations(); // 🔹 Charger tout le planning par défaut

  }

  loadTechniciens(): void {
    this.authService.getTechnicien().subscribe({
      next: (res) => {
        this.techniciens = res;
        this.isLoading = false;
        this.specialites = Array.from(new Set(res.map((t: any) => t.specialite).filter(Boolean)));

      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('Erreur', 'Chargement techniciens échoué.', 'error');
      }
    });
  }
get techniciensFiltres(): any[] {
  if (!this.selectedSpecialite) return this.techniciens;
  return this.techniciens.filter(t => t.specialite === this.selectedSpecialite);
}

  loadAffectationsTechnicien(technicienId: number): void {
    if (!technicienId) {
      this.datesPrevues = [];
      this.autorisations = [];
    this.calendarOptions.events = [];

      return;
    }

    this.authService.getAffectations({ technicien_id: technicienId }).subscribe({
      next: (res: any) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.datesPrevues = (res.affectations || [])
          .filter((a: any) => new Date(a.datePrevu).setHours(0, 0, 0, 0) >= today.getTime())
          .map((a: any) => ({ datePrevu: a.datePrevu }));

        this.autorisations = res.autorisations || [];
              this.loadCalendarForTechnicien(technicienId);

      },
      error: () => {
        this.datesPrevues = [];
        this.autorisations = [];
        Swal.fire('Erreur', 'Chargement affectations échoué.', 'error');
      }
    });
  }

  submitAffectation(): void {
    const datePrevu = new Date(this.affectation.date_prevu);
    const heure = datePrevu.getHours();
  const jour = datePrevu.getDay(); // 0 = dimanche, 6 = samedi

if (jour === 0 || jour === 6) {
    Swal.fire('Jour non autorisé', 'Impossible d\'affecter un technicien le samedi ou le dimanche.', 'warning');
    return;
  }
    if (heure < 8 || heure >= 17) {
      Swal.fire('Heure invalide', 'L\'heure doit être entre 08:00 et 17:00.', 'warning');
      return;
    }

    const conflitHoraire = this.datesPrevues.some(existing => {
      const existingDate = new Date(existing.datePrevu);
      return Math.abs(datePrevu.getTime() - existingDate.getTime()) < 3600000;
    });

    if (conflitHoraire) {
      Swal.fire('Conflit horaire', 'Il doit y avoir au moins 1 heure entre deux affectations.', 'warning');
      return;
    }

    const nbAffectationsJour = this.datesPrevues.filter(existing => {
      const d1 = new Date(existing.datePrevu).toISOString().split('T')[0];
      const d2 = datePrevu.toISOString().split('T')[0];
      return d1 === d2;
    }).length;

    if (nbAffectationsJour >= 8) {
      Swal.fire('Limite dépassée', 'Ce technicien a déjà 8 affectations ce jour-là.', 'warning');
      return;
    }

    this.affectation.date_affectation = new Date().toISOString();

    this.authService.createAffectation(this.affectation).subscribe({
      next: () => {
        Swal.fire('Succès', 'Affectation créée avec succès.', 'success').then(() => {
         ;
        });
      },
       error: (err) => {
      // Si le backend retourne une erreur spécifique sur la date prévue
      if (err.status === 400 && err.error?.error === 'La date prévue doit être égale ou postérieure à la date actuelle.') {
        Swal.fire('Date invalide', err.error.error, 'error');
      } else {
        const msg = err.status === 409 ? err.error?.error : 'Erreur lors de la création de l\'affectation';
        Swal.fire('Erreur', msg, 'error');
      }
    }
  });
}

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth'
    },
    events: [],
    eventDisplay: 'block',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventContent: this.customEventContent.bind(this)
    
  };

  customEventContent(arg: any) {
    const eventDate = new Date(arg.event.start);
    const formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'terminee': return 'Terminée';
      case 'autorisation': return 'Autorisation';
      default: return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'en_attente': return '#FFA500';
      case 'en_cours': return '#2196F3';
      case 'terminee': return '#077a0c';
      case 'autorisation': return '#dc3545';
      default: return '#9E9E9E';
    }
  }
  onTechnicienSelected(technicienId: number): void {
  if (!technicienId) {
    this.loadAllAffectations(); // 🔁 Si aucun technicien sélectionné, recharger tout
  } else {
    this.loadAffectationsTechnicien(technicienId); // 🔎 Sinon, charger celui sélectionné
  }
}

loadAllAffectations(): void {
  this.authService.getAllAffectations().subscribe({
    next: (res: any) => {
      const events: any[] = [];

      // 🔵 Toutes les affectations
      for (const aff of res.affectations) {
        events.push({
          id: aff.id,
          title: `#${aff.demande_id} - ${aff.technicien_nom} ${aff.technicien_prenom}`,
          start: aff.datePrevu,
          extendedProps: {
            demandeId: aff.demande_id,
            technicien: `${aff.technicien_nom} ${aff.technicien_prenom}`,
            status: aff.statutAffectation,
            description: aff.demande_description
          },
          color: this.getStatusColor(aff.statutAffectation),
          allDay: false
        });
      }

      //  Toutes les autorisations
      for (const auth of res.autorisations) {
        events.push({
          title: `Autorisation: ${auth.raison}`,
          start: new Date(auth.dateDebut),
          end: new Date(auth.dateFin),
          extendedProps: {
            status: 'autorisation',
            description: auth.raison,
            dateDebut: auth.dateDebut,
            dateFin: auth.dateFin
          },
          color: this.getStatusColor('autorisation'),
          allDay: false
        });
      }

      this.calendarOptions.events = events;
      this.calendarOptions = { ...this.calendarOptions };
    },
    error: () => {
      Swal.fire('Erreur', 'Impossible de charger toutes les affectations.', 'error');
    }
  });
}

  loadCalendarForTechnicien(technicienId: number): void {
  if (!technicienId) {
    this.calendarOptions.events = [];
    return;
  }

  this.authService.getAffectations({ technicien_id: technicienId }).subscribe({
    next: (res: any) => {
      const events: any[] = [];

      for (const aff of res.affectations) {
        events.push({
          id: aff.id,
          title: `#${aff.demande_id} - ${aff.technicien_nom} ${aff.technicien_prenom}`,
          start: aff.datePrevu,
          extendedProps: {
            demandeId: aff.demande_id,
            technicien: `${aff.technicien_nom} ${aff.technicien_prenom}`,
            status: aff.statutAffectation,
            description: aff.demande_description
          },
          color: this.getStatusColor(aff.statutAffectation),
          allDay: false
        });
      }

      for (const auth of res.autorisations) {
        events.push({
          title: `Autorisation: ${auth.raison}`,
          start: new Date(auth.dateDebut),
          end: new Date(auth.dateFin),
          extendedProps: {
            status: 'autorisation',
            description: auth.raison,
            dateDebut: auth.dateDebut,
            dateFin: auth.dateFin
          },
          color: this.getStatusColor('autorisation'),
          allDay: false
        });
      }

      this.calendarOptions.events = events;
      this.calendarOptions = { ...this.calendarOptions }; // Refresh
    },
    error: () => {
      Swal.fire('Erreur', 'Impossible de charger le planning du technicien.', 'error');
    }
  });
}
}
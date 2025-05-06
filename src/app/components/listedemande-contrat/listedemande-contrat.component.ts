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
  isLoading: boolean = true;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
     this.isAdmin = roles.includes('ROLE_ADMIN');
    const email = sessionStorage.getItem('userEmail');
    const role = roles.includes('ROLE_CLIENT') ? 'ROLE_CLIENT' : '';

    this.loadDemandes(email, role);
  }

  loadDemandes(email: string | null, role: string): void {
    this.isLoading = true;
  
    if (this.isAdmin) {
      this.authService.getDemandesContrat().subscribe({
        next: (response) => {
          this.demandes = response.data || [];
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
          this.demandes = response.data || [];
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
      demande.description?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      demande.client?.entreprise?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      demande.statut?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}

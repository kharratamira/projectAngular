// src/app/components/liste-satisfaction-client/liste-satisfaction-client.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // pour *ngIf, *ngFor
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NgxPaginationModule } from 'ngx-pagination'; // Pagination

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
      item.client.nom.toLowerCase().includes(search) ||
      item.client.prenom.toLowerCase().includes(search) ||
      item.client.entreprise.toLowerCase().includes(search) ||
      item.client.email.toLowerCase().includes(search) ||
      item.satisfaction.niveau.toString().toLowerCase().includes(search) ||
      item.satisfaction.commentaire?.toLowerCase().includes(search) ||
      item.intervention.observation?.toLowerCase().includes(search)
    );
  }
}

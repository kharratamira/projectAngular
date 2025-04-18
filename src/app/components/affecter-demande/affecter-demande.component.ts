import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-affecter-demande',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './affecter-demande.component.html',
  styleUrl: './affecter-demande.component.css'
})
export class AffecterDemandeComponent implements OnInit {

  techniciens: any[] = [];
  demandeId!: number;
  isLoading = true;

  affectation = {
    demande_id: 0,
    technicien_id: 0,
    date_prevu: '',
    date_affectation: ''
  };

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.demandeId = +this.route.snapshot.params['id'];
    this.affectation.demande_id = this.demandeId;

    this.loadTechniciens();
  }

  loadTechniciens(): void {
    this.authService.getTechnicien().subscribe({
      next: (res) => {
        console.log('Techniciens reçus:', res);
        this.techniciens = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des techniciens',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  }

  submitAffectation(): void {
    this.affectation.date_affectation = new Date().toISOString();
    this.authService.createAffectation(this.affectation).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Affectation créée avec succès!',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true
        }).then(() => {
          this.router.navigate(['/dashbord/liste-demandes']); // Redirection après confirmation
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.error?.error || 'Erreur lors de la création de l\'affectation',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  }
}

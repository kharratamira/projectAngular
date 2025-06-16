import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-autorisation-sortie',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './autorisation-sortie.component.html',
  styleUrls: ['./autorisation-sortie.component.css']
})
export class AutorisationSortieComponent {
    dateDebut: string = '';
    dateFin: string = '';
    raison: string = '';
  
    constructor(private authService: AuthService) {}
    validateDate(date: string): boolean {
        const selectedDate = new Date(date).getTime();
        const currentDate = new Date().getTime();
        return selectedDate > currentDate; // Vérifie que la date est strictement dans le futur
      }
      onSubmit(): void {
        const currentDate = new Date();
      
        console.log('Date de début :', this.dateDebut);
        console.log('Date de fin :', this.dateFin);
        console.log('Raison :', this.raison);
      
        // Vérifiez si tous les champs sont remplis correctement
        if (!this.dateDebut || !this.dateFin || !this.raison || this.raison.length < 10) {
          Swal.fire('Erreur', 'Veuillez remplir tous les champs correctement', 'error');
          return;
        }
      
        // Vérifiez si la date de début est supérieure à la date système
        if (!this.validateDate(this.dateDebut)) {
          Swal.fire('Erreur', 'La date de début doit être supérieure à la date actuelle', 'error');
          return;
        }
      
        // Vérifiez si la date de fin est supérieure à la date de début
        if (new Date(this.dateFin) <= new Date(this.dateDebut)) {
          Swal.fire('Erreur', 'La date de fin doit être supérieure à la date de début', 'error');
          return;
        }
        
      
        // Récupérer l'ID du technicien depuis sessionStorage
        const idTechnicien = sessionStorage.getItem('userId');
        if (!idTechnicien) {
          Swal.fire('Erreur', 'Technicien non connecté', 'error');
          return;
        }
      
        const formData = {
          id_technicien: idTechnicien, // Inclure l'ID du technicien
          dateDebut: this.dateDebut,
          dateFin: this.dateFin,
          raison: this.raison
        };
      
        this.authService.createAutorisation(formData).subscribe({
          next: () => Swal.fire('Succès', 'Autorisation enregistrée !', 'success'),
          error: (err) => {
            console.error(err);
            const errorMessage = err.error?.error || 'Une erreur est survenue';
            Swal.fire('Erreur', errorMessage, 'error');
          }
        });
      }}
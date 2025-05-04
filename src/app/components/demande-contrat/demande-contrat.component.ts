import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
//import {NgxEditorModule, Toolbar,Editor } from 'ngx-editor';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
@Component({
  selector: 'app-demande-contrat',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  standalone: true,
  templateUrl: './demande-contrat.component.html',
  styleUrl: './demande-contrat.component.css'
})
export class DemandeContratComponent {
  description: string = ''; // Description de la demande
 
  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    // Initialiser l'éditeur
  }
 
  onSubmit(): void {
    const id_client = sessionStorage.getItem('userId');
    
    if (!id_client) {
      Swal.fire('Erreur', 'Client non connecté', 'error');
      return;
    }

    if (!this.description.trim()) {
      Swal.fire('Erreur', 'La description est requise.', 'error');
      return;
    }

    const formData = {
      client_id: id_client,
     description: this.description,
            };
          
            this.authService.createDemandeContrat(formData).subscribe({
              next: () => {
                Swal.fire('Succès', 'Demande de contrat créée avec succès.', 'success');
                this.description = ''; // Reset form
              },
              error: (err) => {
                const errorMessage = err.error?.error || 'Une erreur est survenue';
                Swal.fire('Erreur', errorMessage, 'error');
              }
            });
          }
        }   
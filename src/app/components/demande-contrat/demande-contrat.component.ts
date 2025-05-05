import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { NgxEditorModule } from 'ngx-editor';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Editor } from 'ngx-editor';

@Component({
  selector: 'app-demande-contrat',
  imports: [CommonModule, FormsModule, NgxEditorModule],
  standalone: true,
  templateUrl: './demande-contrat.component.html',
  styleUrls: ['./demande-contrat.component.css']
})
export class DemandeContratComponent implements OnInit, OnDestroy {
  description: string = ''; // Description de la demande
  editor!: Editor;  // L'éditeur ngx-editor

  ngOnInit(): void {
    this.editor = new Editor();  // Initialisation de l'éditeur
  }

  ngOnDestroy(): void {
    this.editor.destroy();  // Nettoyage de l'éditeur lors de la destruction du composant
  }

  constructor(private authService: AuthService) {}

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
      description: this.description, // Envoi de la description récupérée
    };
    
    this.authService.createDemandeContrat(formData).subscribe({
      next: () => {
        Swal.fire('Succès', 'Demande de contrat créée avec succès.', 'success');
        this.description = ''; // Réinitialisation de la description
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'Une erreur est survenue';
        Swal.fire('Erreur', errorMessage, 'error');
      }
    });
  }

  // Cette méthode permet de capturer la modification du contenu de l'éditeur
  onEditorChange(value: string): void {
    this.description = value;
  }
}

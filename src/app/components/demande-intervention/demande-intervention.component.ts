import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-demande-intervention',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './demande-intervention.component.html',
  styleUrls: ['./demande-intervention.component.css']
})
export class DemandeInterventionComponent implements OnInit {
  demandeForm!: FormGroup;
  emailUtilisateur: string | null = null;  // Stocker l'email de l'utilisateur connecté

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    // Vérifier si l'utilisateur est connecté en récupérant l'email
    this.emailUtilisateur = sessionStorage.getItem('userEmail');

    if (!this.emailUtilisateur) {
      // Si aucun email trouvé dans localStorage, rediriger vers la page de connexion
      Swal.fire({
        icon: 'error',
        title: 'Non connecté',
        text: 'Merci de vous connecter avant de faire une demande.'
      }).then(() => {
        this.router.navigate(['/login']);
      });
    } else {
      // Initialiser le formulaire si l'utilisateur est connecté
      this.initForm();
    }
  }

  initForm() {
    this.demandeForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]],
      statut: ['en_attente', Validators.required],
      photo1: [''],
      photo2: [''],
      photo3: ['']

    });
  }
  onFileChange(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
  
    if (!file) return;
  
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSizeMB = 3;
  
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Type de fichier non supporté',
        text: 'Seules les images PNG, JPG et JPEG sont autorisées.'
      });
      return;
    }
  
    if (file.size > maxSizeMB * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Fichier trop volumineux',
        text: `La taille maximale autorisée est de ${maxSizeMB} Mo.`
      });
      return;
    }
  
    const reader = new FileReader();
    reader.onload = () => {
      this.demandeForm.patchValue({
        [controlName]: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  }
  
  
  onSubmit() {
    if (this.demandeForm.invalid) {
      this.demandeForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Formulaire incomplet',
        text: 'Merci de remplir correctement tous les champs !'
      });
      return;
    }  

    // Vérifier si l'utilisateur est connecté avant de soumettre la demande
    if (!this.emailUtilisateur) {
      Swal.fire({
        icon: 'error',
        title: 'Utilisateur non trouvé',
        text: 'Impossible de récupérer l\'utilisateur connecté. Merci de vous reconnecter.'
      });
      return;
    }

    // Formulaire valide et utilisateur connecté, soumettre la demande
    const demandeData = {
      description: this.demandeForm.value.description,
      statut: this.demandeForm.value.statut,
      email: this.emailUtilisateur,
      photo1: this.demandeForm.value.photo1 ,
      photo2: this.demandeForm.value.photo2 ,
      photo3: this.demandeForm.value.photo3 
    };
  

    console.log("Form Data:", demandeData);

    // Logique pour soumettre la demande
    this.authService.saveDemandeAvecClient(demandeData).subscribe({
      next: (response: any) => {
        console.log("Succès :", response);
        Swal.fire({
          title: 'Succès !',
          text: 'La demande a été envoyée avec succès.',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 3000, // Fermer automatiquement après 3 secondes
          timerProgressBar: true,
        });
        this.demandeForm.reset();
      },
      error: (error: HttpErrorResponse) => {
        console.error("Erreur :", error.error); // Affiche le corps de la réponse d'erreur
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors de l\'envoi',
          text: 'Une erreur est survenue. Veuillez réessayer plus tard.'
        });
      }
    });
  }
}

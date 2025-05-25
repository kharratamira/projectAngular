import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ajouter-user',
  standalone: true,
  imports:[ ReactiveFormsModule, CommonModule],
  templateUrl: './ajouter-user.component.html',
  styleUrl: './ajouter-user.component.css'
})
export class AjouterUserComponent {
  addUserForm!: FormGroup;
  successMessage = '';
  errorMessage = '';
  selectedPhotoBase64: string | null = null;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.addUserForm = this.fb.group({
      user_type: ['', Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      numTel: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],

      // Champs spécifiques selon le type de user
      adresse:[''],
      entreprise:[''],
      specialite: [''],
      disponibilite: [true],
      region: [''],
      photo: [''] 
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedPhotoBase64 = (reader.result as string).split(',')[1]; // Extraction de la partie Base64
        this.addUserForm.patchValue({ photo: this.selectedPhotoBase64 });
      };
      reader.readAsDataURL(file); // Lecture du fichier en Base64
    }
  }
  onSubmit(): void {
    if (this.addUserForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Merci de remplir correctement tous les champs.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    const userData = this.addUserForm.value;

    // Nettoyage des champs inutiles selon le type d'utilisateur
    if (userData.user_type === 'technicien') {
      delete userData.region;
      delete userData.adresse;
      delete userData.entreprise;
    } else if (userData.user_type === 'commercial') {
      delete userData.specialite;
      delete userData.disponibilite;
      delete userData.adresse;
      delete userData.entreprise;
    } else if (userData.user_type === 'client') {
      delete userData.specialite;
      delete userData.disponibilite;
      delete userData.region;
    } else {
      // pour 'admin' ou autres types
      delete userData.region;
      delete userData.specialite;
      delete userData.disponibilite;
      delete userData.adresse;
      delete userData.entreprise;
    }
    
    console.log('Sending user data:', userData); // Log the user data being sent

    this.authService.signupUser(userData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Utilisateur créé avec succès !',
          confirmButtonColor: '#3085d6',
          timer: 3000
        }).then(() => {
          this.addUserForm.reset({ disponibilite: true });
        });
      },
      error: (error) => {
        console.error('Signup error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error?.message || 'Merci de remplir correctement tous les champs',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }
}


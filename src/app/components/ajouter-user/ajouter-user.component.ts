import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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
    this.successMessage = '';
    this.errorMessage = '';

    if (this.addUserForm.invalid) {
      this.errorMessage = 'Merci de remplir correctement tous les champs.';
      return;
    }
    const userData = this.addUserForm.value;

    // Nettoyage des champs inutiles selon le type d'utilisateur
    if (userData.user_type === 'technicien') {
      delete userData.region;
    } else if (userData.user_type === 'commercial') {
      delete userData.specialite;
      delete userData.disponibilite;
    } else {
      delete userData.region;
      delete userData.specialite;
      delete userData.disponibilite;
    }
    console.log('Sending user data:', userData); // Log the user data being sent

    this.authService.signupUser(userData).subscribe({
      next: () => {
        this.successMessage = 'Utilisateur créé avec succès !';
        this.addUserForm.reset({ disponibilite: true }); // On garde la dispo à true pour technicien
      },
      error: (error) => {
        console.error('Signup error:', error); // Log the error response
        this.errorMessage = error.error?.message || 'Erreur lors de la création';
      }
    });
  }
}


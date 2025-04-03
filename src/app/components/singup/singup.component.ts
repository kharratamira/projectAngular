import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-singup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './singup.component.html',
  styleUrl: './singup.component.css'
})
export class SingupComponent {
  signupForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  // photoFile: File | null = null;
  // photoError: string | null = null;
  selectedPhotoBase64: string | null = null; // Variable pour stocker l'image sélectionnée

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.signupForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      adresse: ['', Validators.required],
      numTel: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      entreprise: ['', [Validators.required]],
      photo: [''] 
    });
   
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
  
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'Le fichier image est trop volumineux. Taille maximale : 2 Mo';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedPhotoBase64 = (reader.result as string).split(',')[1]; // Extract base64 part
        this.signupForm.patchValue({ photo: this.selectedPhotoBase64 });
      };
      reader.readAsDataURL(file); // Convert file to base64
    }
  }
  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';
  
    if (this.signupForm.invalid) {
      this.errorMessage = 'Merci de remplir tous les champs correctement.';
      return;
    }
  
    const formData = new FormData();
    
    // Ajout des champs du formulaire
    formData.append('email', this.signupForm.get('email')?.value);
    formData.append('password', this.signupForm.get('password')?.value);
    formData.append('nom', this.signupForm.get('nom')?.value);
    formData.append('prenom', this.signupForm.get('prenom')?.value);
    formData.append('adresse', this.signupForm.get('adresse')?.value);
    formData.append('numTel', this.signupForm.get('numTel')?.value);
    formData.append('entreprise', this.signupForm.get('entreprise')?.value);
  
    // Ajout de la photo si elle existe
    const photoInput = document.getElementById('photo') as HTMLInputElement;
    if (photoInput.files && photoInput.files[0]) {
      formData.append('photo', photoInput.files[0]);
    }
  
    this.authService.signupClient(formData).subscribe({
      next: (response) => {
        this.successMessage = 'Inscription réussie !';
        this.signupForm.reset();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur lors de l\'inscription:', error);
        this.errorMessage = typeof error === 'string' ? error : 
                           error.error?.error || 'Une erreur est survenue lors de l\'inscription';
        
        // Gestion spécifique des champs manquants
        if (error.error?.missing_fields) {
          this.errorMessage += ': ' + error.error.missing_fields.join(', ');
        }
      }
    });
  }}
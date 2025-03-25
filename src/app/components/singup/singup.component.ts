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
      entreprise: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.signupForm.invalid) {
      this.errorMessage = 'Merci de remplir tous les champs correctement.';
      return;
    }

    const signupData = this.signupForm.value;

    this.authService.signup(signupData).subscribe({
      next: (response) => {
        console.log(response);
        this.successMessage = 'Inscription réussie !';
        this.signupForm.reset(); // Réinitialiser le formulaire
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = error.error?.error || 'Une erreur est survenue';
      }
    });
  }}


import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Import Router for redirection
import Swal from 'sweetalert2';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // Corrected `styleUrl` to `styleUrls`
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { // Inject Router here
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  onSubmit(): void {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email.trim();
      const password = this.loginForm.value.password.trim();
            console.log('Form Data:', { email, password });
            this.isLoading = true;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;

          console.log('Login réussi:', response);
          console.log('User data:', response.user);

          
          const user = response.user;
          sessionStorage.setItem('auth_token', response.token); // Ajout du token

          sessionStorage.setItem('userId', response.user.id);
          sessionStorage.setItem('userEmail', response.user.email);
          sessionStorage.setItem('userNom', response.user.nom);
          sessionStorage.setItem('userPrenom', response.user.prenom);
          sessionStorage.setItem('userPhoto', response.user.photo);
          sessionStorage.setItem('roles', JSON.stringify(response.roles));
          
          console.log('SessionStorage:', {
            userId: sessionStorage.getItem('userId'),
            userEmail: sessionStorage.getItem('userEmail'),
            userNom: sessionStorage.getItem('userNom'),
            userPrenom: sessionStorage.getItem('userPrenom'),
            userPhoto: sessionStorage.getItem('userPhoto'),
            roles: sessionStorage.getItem('roles'),
            token: sessionStorage.getItem('auth_token')
          });

          // Redirection vers dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
  this.isLoading = false;
  console.error('Erreur brute du backend :', error);
  console.log('Contenu de error.error :', error.error);

  const backendMessage = error?.error?.error || error?.error?.message || error?.message || null;

  if (backendMessage === 'Account is not active') {
    Swal.fire({
      icon: 'warning',
      title: 'Compte inactif',
      text: 'Votre compte est inactif. Veuillez contacter l\'administrateur.',
    });
  } else if (backendMessage === 'Account does not exist') {
    Swal.fire({
      icon: 'error',
      title: 'Compte introuvable',
      text: 'Aucun compte trouvé avec cet email.',
    });
  } else if (backendMessage === 'Invalid credentials') {
    Swal.fire({
      icon: 'error',
      title: 'Identifiants invalides',
      text: 'Email ou mot de passe incorrect.',
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Erreur inconnue',
      text: 'Une erreur est survenue. Veuillez réessayer plus tard.',
    });
  }
}
      });
    }}}
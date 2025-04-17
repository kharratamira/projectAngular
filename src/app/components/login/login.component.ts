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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { // Inject Router here
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  
  // onSubmit(): void {
  //   if (this.loginForm.valid) {
  //     const { email, password } = this.loginForm.value;
  //     console.log('Form Data:', { email, password }); 
  //     this.authService.login(email, password).subscribe({
  //       next: (response) => {
  //         console.log('Login réussi:', response);
  //         console.log('User data:', response.user);
  //         // Stocker l'email de l'utilisateur dans localStorage
  //         sessionStorage.setItem('userId', response.user.id);
  //        sessionStorage.setItem('userEmail', response.user.email);
  //       sessionStorage.setItem('userNom', response.user.nom);
  //       sessionStorage.setItem('userPrenom', response.user.prenom);
  //       sessionStorage.setItem('userPhoto', response.user.photo); 
  //       sessionStorage.setItem('roles', JSON.stringify(response.roles)); 

  //       console.log('Email stocké dans sessionStorage :', sessionStorage.getItem('userEmail'));
  //       console.log('Nom stocké dans sessionStorage :', sessionStorage.getItem('userNom'));
  //       console.log('Prénom stocké dans sessionStorage :', sessionStorage.getItem('userPrenom'));
  //       console.log('Photo stockée dans sessionStorage :', sessionStorage.getItem('userPhoto'));
  //       console.log('Roles stockés dans sessionStorage :', sessionStorage.getItem('roles'));
  //         // Rediriger vers la page de demande d'intervention après la connexion réussie
  //         this.router.navigate(['/dashboard']);
  //       },
  //       error: (error) => {
  //         this.errorMessage = 'Email ou mot de passe incorrect';
  //         Swal.fire({
  //           icon: 'error',
  //           title: 'Oops...',
  //           text: 'Email ou mot de passe incorrect!',
  //         });
  //         console.error(error);
          
  //       }
        
  //     });
  //   }
  // }
  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      console.log('Form Data:', { email, password });

      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Login réussi:', response);
          console.log('User data:', response.user);

          // Stockage dans sessionStorage
          sessionStorage.setItem('userId', response.user.id);
          sessionStorage.setItem('userEmail', response.user.email);
          sessionStorage.setItem('userNom', response.user.nom);
          sessionStorage.setItem('userPrenom', response.user.prenom);
          sessionStorage.setItem('userPhoto', response.user.photo);
          sessionStorage.setItem('roles', JSON.stringify(response.roles));

          // Debug logs
          console.log('Email stocké dans sessionStorage :', sessionStorage.getItem('userEmail'));
          console.log('Nom stocké dans sessionStorage :', sessionStorage.getItem('userNom'));
          console.log('Prénom stocké dans sessionStorage :', sessionStorage.getItem('userPrenom'));
          console.log('Photo stockée dans sessionStorage :', sessionStorage.getItem('userPhoto'));
          console.log('Roles stockés dans sessionStorage :', sessionStorage.getItem('roles'));

          // Redirection vers dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Erreur complète:', error);
        
          const backendMessage = error?.error?.error || error?.message || null;
          console.log('Message d’erreur reçu du backend:', backendMessage);
        
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
      });        }}}
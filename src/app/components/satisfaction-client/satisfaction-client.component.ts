import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import {  ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-satisfaction-client',
  templateUrl: './satisfaction-client.component.html',
  styleUrl: './satisfaction-client.component.css',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class SatisfactionClientComponent {
  satisfactionForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) { 
    this.satisfactionForm = this.fb.group({
      niveau: ['', Validators.required],
      commentaire: [''],
      intervention_id: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.satisfactionForm.invalid) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    this.authService.satisfactionClient(this.satisfactionForm.value).subscribe({
  next: (res) => {
    Swal.fire('Merci !', 'Votre avis a bien été enregistré.', 'success');
    this.satisfactionForm.reset();
  },
  error: () => {
    Swal.fire('Erreur', 'Une erreur est survenue.', 'error');
  }
});

}}

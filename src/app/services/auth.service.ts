
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';

import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/';
  constructor(private http: HttpClient, private router: Router) { }
  login(email: string, password: string): Observable<any> {
    // Validation des entrées
    if (!email || !password) {
      return throwError(() => new Error('Email and password are required'));
    }

    return this.http.post(`${this.apiUrl}login_client`, { email, password }).pipe(
      tap((response: any) => {

      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => new Error('Login failed. Please check your credentials.'));
      })
    );
  }

  isLoggedIn(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }


    return this.http.get<{ authenticated: boolean }>(`${this.apiUrl}sessionUser`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response) => response.authenticated),
      catchError(() => of(false))
    );
  }

  getUserInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}sessionUser`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Failed to fetch user info:', error);
        if (error.status === 401) {
          return throwError(() => new Error('Unauthorized. Please log in again.'));
        } else {
          return throwError(() => new Error('Failed to fetch user information.'));
        }
      })
    );
  }

  logout(): void {
    console.log('Déconnexion en cours...');
    sessionStorage.clear();

    console.log('SessionStorage après clear:', sessionStorage);

    this.router.navigate(['/login']).then(() => {
      //window.location.reload();
    });
  }
  signupUser(userData: any) {
    return this.http.post(`${this.apiUrl}signup`, userData, {
      headers: {
        //  Authorization: `Bearer ${this.getToken()}` // Ton token JWT si besoin
      }
    });
  }


  saveDemandeAvecClient(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}saveDemande`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  getClientsWithDemande(): Observable<any> {
    return this.http.get(`${this.apiUrl}listeClient`, {
      headers: this.getAuthHeaders()
    });
  }

  updateClient(client: any): Observable<any> {
    return this.http.put(`${this.apiUrl}updateClient/${client.id}`, client, {
      headers: this.getAuthHeaders()
    });
  }


  deleteClient(clientId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}deleteClient/${clientId}`, {
      headers: this.getAuthHeaders()
    });
  }
  getDemandes(): Observable<any> {
    return this.http.get(`${this.apiUrl}getDemandes`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Pour les clients - Récupère leurs demandes
  getClientDemandes(): Observable<any> {
    const userEmail = sessionStorage.getItem('usermail');
    if (!userEmail) {
      return throwError(() => new Error('Aucun email trouvé en session'));
    }

    return this.http.get(`${this.apiUrl}demandesclient/${encodeURIComponent(userEmail)}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }



  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      console.warn('No token found!'); // Debug
      this.logout();
      throw new Error('No authentication token available');
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Erreur inconnue';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      errorMessage = `Erreur serveur: ${error.status} - ${error.error?.message || error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }



  updateDemande(updatedDemande: any): Observable<any> {
    return this.http.put(`${this.apiUrl}updateDemande/${updatedDemande.id}`, updatedDemande, {
      headers: this.getAuthHeaders()
    });
  }

  deleteDemande(demandeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}deleteDemande/${demandeId}`, {
      headers: this.getAuthHeaders()
    });
  }

  acceptDemande(demandeId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}acceptDemande/${demandeId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  cancelDemande(demandeId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}cancelDemande/${demandeId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  getTechnicien(): Observable<any> {
    return this.http.get(`${this.apiUrl}getTechnicien`, {
      headers: this.getAuthHeaders()
    });
  }

  updateTechnicien(id: number, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}updateTechnicien/${id}`, user, {
      headers: this.getAuthHeaders()
    });
  }

  desactiverUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}desactiveUser/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  activeUser(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}activateUser/${id}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  getCommercial(): Observable<any> {
    return this.http.get(`${this.apiUrl}getCommercial`, {
      headers: this.getAuthHeaders()
    });
  }

  updateCommercial(id: number, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}updateCommercial/${id}`, user, {
      headers: this.getAuthHeaders()
    });
  }

  createAffectation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}createAffectation`, data, {
      headers: this.getAuthHeaders()
    });
  }

  getAffectationsForTechnicien(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}getAffectationss`, {
      params: { email },
      headers: this.getAuthHeaders()
    });
  }


  getAffectations(filters: any): Observable<any> {
    const params = new HttpParams({ fromObject: filters });
    return this.http.get<any>(`${this.apiUrl}getAffectation`, {
      params,
      headers: this.getAuthHeaders()
    });
  }
  // Dans auth.service.ts

  createAutorisation(data: { id_technicien: string; dateDebut: string; dateFin: string; raison: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}Createautorisation`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }


  private getToken(): string | null {
    return sessionStorage.getItem('auth_token');
  }
  isTechnician(): boolean {
    const roles = sessionStorage.getItem('roles');
    return roles ? JSON.parse(roles).includes('ROLE_TECHNICIEN') : false;
  }
  getAutorisationsByEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}getAutorisationByEmail?email=${email}`);
  }

  getAllAutorisations(): Observable<any> {
    return this.http.get(`${this.apiUrl}getAllAutorisations`);
  }
  updateAutorisation(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}updateAutorisation/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deleteAutorisation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}deleteAutorisation/${id}`);
  }
  accepterAutorisation(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}accepterAutorisation/${id}`, {}, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  annulerAutorisation(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}annulerAutorisation/${id}`, {}, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  updateStatutEnCours(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}enCour/${id}`, {}, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // Ajuste l’URL si besoin

  getTaches(): Observable<any> {
    return this.http.get(`${this.apiUrl}taches`);
  }

  createIntervention(data: { affectation_id: number; observation: string; taches: number[] }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}intervention`, data, {
      headers: this.getAuthHeaders()
    });
  }

  getAllInterventions(): Observable<any> {
    return this.http.get(`${this.apiUrl}getAllInterventions`);
  }

  // Récupérer les interventions d'un client
  // getClientInterventions(email: string): Observable<any> {
  //   return this.http.get(`${this.apiUrl}getClientInterventions?email=${encodeURIComponent(email)}`);
  // }
  getInterventionsByEmail(email: string, role: string): Observable<any> {
    return this.http.get(`${this.apiUrl}getInterventionsByEmail`, {
      params: { email, role },
      headers: this.getAuthHeaders()
    });
  }
  updateIntervention(id: number, data: { observation: string; taches: number[] }): Observable<any> {
    return this.http.put(`${this.apiUrl}updateIntervention/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  createDemandeContrat(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}createDemandeContrat`, data);
  }

  getDemandesContrat(): Observable<any> {
    return this.http.get(`${this.apiUrl}getAllDemandesContrat`).pipe(
      map(response => {
        // Gestion de la compatibilité avec les anciennes versions
        return response.hasOwnProperty('data') ? response : { data: response };
      }),
      catchError(error => {
        console.error('Error loading demandes', error);
        return throwError(() => new Error('Erreur de chargement'));
      })
    );
  }

  getDemandeContratByEmail(email: string, role: string): Observable<any> {
    return this.http.get(`${this.apiUrl}getDemandeContratByEmail`, {
      params: { email, role }
    }).pipe(
      catchError(error => {
        console.error('Error loading client demandes', error);
        return throwError(() => new Error('Erreur de chargement'));
      })
    );
  }
  acceptDemandeContrat(demandeId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}acceptDemandecontrat/${demandeId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  cancelDemandeContrat(demandeId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}cancelDemandeContrat/${demandeId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }
  updateDemandeContrat(id: number, data: { description: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}updateDemandeContrat/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  createContrat(demandeId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}createContrat/${demandeId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }
  getContratByDemande(demandeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}getContratByDemande/${demandeId}`, {
      headers: this.getAuthHeaders()
    });
  }
acceptContrat(contratId: number): Observable<any> {
  return this.http.put(
    `${this.apiUrl}acceptContrat/${contratId}`,
    {}, // Corps vide pour une requête PUT
    { headers: this.getAuthHeaders() }
  );
}

cancelContrat(contratId: number): Observable<any> {
  return this.http.put(
    `${this.apiUrl}cancelContrat/${contratId}`,
    {},
    { headers: this.getAuthHeaders() }
  );
}
 getContrat(): Observable<any> {
    return this.http.get(`${this.apiUrl}getAllContrat`).pipe(
      map(response => {
        // Gestion de la compatibilité avec les anciennes versions
        return response.hasOwnProperty('data') ? response : { data: response };
      }),
      catchError(error => {
        console.error('Error loading demandes', error);
        return throwError(() => new Error('Erreur de chargement'));
      })
    );
  }

  getContratByEmail(email: string, role: string): Observable<any> {
    return this.http.get(`${this.apiUrl}getContratByEmail`, {
      params: { email, role }
    }).pipe(
      catchError(error => {
        console.error('Error loading client demandes', error);
        return throwError(() => new Error('Erreur de chargement'));
      })
    );
  }
 
 getAllAffectations(): Observable<any> {
    return this.http.get(`${this.apiUrl}getAffectation`, {
      headers: this.getAuthHeaders()
    });
  }
 genererFacture(interventionId: number, remise: number): Observable<any> {
  return this.http.post(`${this.apiUrl}genererfacture/${interventionId}`, { remise });
}

previewFacture(interventionId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}facturepreview/${interventionId}`);
}


// Toutes les factures (admin)


// Factures du client connecté (par email)
getAllFactures(): Observable<any> {
  return this.http.get(`${this.apiUrl}factures`);
}

getFacturesByClient(email: string): Observable<any> {
  return this.http.get(`${this.apiUrl}facturesclient`, { params: { email } });
}
satisfactionClient(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}satisfaction`, data);
}
getAllSatisfaction(): Observable<any> {
  return this.http.get(`${this.apiUrl}getSatisfaction`);
}
getAllModesPaiement(): Observable<any> {
  return this.http.get(`${this.apiUrl}getmodePaiement`);
}

 setModesPaiement(factureId: number, modeIds: number[]) {
    return this.http.post(`${this.apiUrl}modes-paiement/${factureId}`, {
      modes: modeIds
    });
  }
   validerPaiement(factureId: number) {
    return this.http.put(`${this.apiUrl}payeeFacture/${factureId}`, {});
  }
}

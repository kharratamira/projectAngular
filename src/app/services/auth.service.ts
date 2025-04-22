
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
  constructor(private http:HttpClient, private router: Router) { }
  login(email: string, password: string): Observable<any> {
  // Validation des entrées
  if (!email || !password) {
    return throwError(() => new Error('Email and password are required'));
  }

  return this.http.post(`${this.apiUrl}login_client`, { email, password }).pipe(
    tap((response: any) => {
      // Stocker les informations de l'utilisateur dans sessionStorage
      sessionStorage.setItem('userId', response.user.id);
      sessionStorage.setItem('userNom', response.user.name);
      sessionStorage.setItem('userPrenom', response.user.surname);
      sessionStorage.setItem('userEmail', response.user.email);
    }),
    catchError((error) => {
      console.error('Login failed:', error);
      return throwError(() => new Error('Login failed. Please check your credentials.'));
    })
  );
}
isLoggedIn(): Observable<boolean> {
  const userId = sessionStorage.getItem('userId');
  if (!userId) {
    return of(false); // Pas d'utilisateur connecté
  }

  // Vérifier l'authentification côté serveur
  return this.http.get<{ authenticated: boolean }>(`${this.apiUrl}sessionUser`).pipe(
    map((response) => response.authenticated),
    catchError(() => of(false)) // En cas d'erreur, considérer que l'utilisateur n'est pas connecté
  );
}
getUserInfo(): Observable<any> {
  return this.http.get(`${this.apiUrl}sessionUser`).pipe(
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
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}saveDemande`, formData, { headers });
  }
  
  getClientsWithDemande(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}listeClient`);
  }
  
  updateClient(client: any): Observable<any> {
    const url = `${this.apiUrl}updateClient/${client.id}`;
    return this.http.put<any>(url, client);
  }

  // Delete client
  deleteClient(clientId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl.replace(/\/$/, '')}/deleteClient/${clientId}`);


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
    const token = sessionStorage.getItem('auth_token'); // À adapter selon votre système
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
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
    const url = `${this.apiUrl}updateDemande/${updatedDemande.id}`;
    console.log("Données envoyées au backend :", updatedDemande); // Ajoutez ce log
    return this.http.put<any>(url, updatedDemande);
  }
  
  
  deleteDemande(demandeId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl.replace(/\/$/, '')}/deleteDemande/${demandeId}`);


}
acceptDemande(demandeId: number): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}acceptDemande/${demandeId}`, {});
}

cancelDemande(demandeId: number): Observable<any> {
  return this.http.put<any>(`${this.apiUrl}cancelDemande/${demandeId}`, {});
}

getTechnicien(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}getTechnicien`);
}
updateTechnicien(id: number, user: any): Observable<any> {
  const url = `${this.apiUrl}updateTechnicien/${id}`;
  return this.http.put(url, user);
}
// Dans votre AuthService
desactiverUser(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}desactiveUser/${id}`);
}

activeUser(id: number): Observable<any> {
  return this.http.put(`${this.apiUrl}activateUser/${id}`, {});
}

getCommercial(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}getCommercial`);
}
updateCommercial(id: number, user: any): Observable<any> {
  const url = `${this.apiUrl}updateCommercial/${id}`;
  return this.http.put(url, user);
}

createAffectation(data: any) {
  return this.http.post(`${this.apiUrl}createAffectation`, data);
}
getAffectationsForTechnicien(email: string): Observable<any[]> {
  const params = new HttpParams().set('email', email);
  
  return this.http.get<any[]>(`${this.apiUrl}getAffectationss`, {
    params,
    headers: this.getAuthHeaders()
  }).pipe(
    catchError(this.handleError)
  );
}

}

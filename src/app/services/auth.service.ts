
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';

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

  // isLoggedIn(): boolean {
  //   const token = localStorage.getItem('access_token');
    
  //   // Optionnel : tu peux aussi vérifier si le token est expiré
  //   return !!token; // true si token existe, false sinon
  // }
  signupClient(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}signup_client`, formData).pipe(
      catchError(error => {
        // Gestion des erreurs spécifiques
        if (error.error?.error) {
          throw error.error.error;
        }
        throw 'Une erreur inconnue est survenue';
      })
    );
  }

  // auth.service.ts

  saveDemandeAvecClient(formData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}saveDemande`, formData, { headers });
  }
  
  
   
  
  
  // isAuthenticated(): boolean {
  //   // Check if there is an authentication token or session
  //   return !!localStorage.getItem('auth_token');
  // }

  // // Get the logged-in user's data
  // getClientData(): any {
  //   // Get client data from local storage, session, or via an API call
  //   return JSON.parse(localStorage.getItem('client_data') || '{}');
  // }
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
  signupUser(userData: any) {
    return this.http.post(`${this.apiUrl}signup`, userData, {
      headers: {
      //  Authorization: `Bearer ${this.getToken()}` // Ton token JWT si besoin
      }
    });
  }
  getDemande(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}getDemandes`);
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
deleteCommercial(id: number): Observable<any> {
  const url = `${this.apiUrl}deleteCommercial/${id}`;
  return this.http.delete(url);
}
}

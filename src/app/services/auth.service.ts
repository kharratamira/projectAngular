
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
      // sessionStorage.setItem('userId', response.user.id);
      // sessionStorage.setItem('userNom', response.user.name);
      // sessionStorage.setItem('userPrenom', response.user.surname);
      // sessionStorage.setItem('userEmail', response.user.email);
      // sessionStorage.setItem('auth_token', response.token); // <<-- Important
      // sessionStorage.setItem('userRole', response.user.role);
    }),
    catchError((error) => {
      console.error('Login failed:', error);
      return throwError(() => new Error('Login failed. Please check your credentials.'));
    })
  );
}
// isLoggedIn(): Observable<boolean> {
//   const userId = sessionStorage.getItem('userId');
//   if (!userId) {
//     return of(false); // Pas d'utilisateur connecté
//   }
isLoggedIn(): Observable<boolean> {
  const token = this.getToken();
  if (!token) {
    return of(false);
  }

  // Vérifier l'authentification côté serveur
  // return this.http.get<{ authenticated: boolean }>(`${this.apiUrl}sessionUser`).pipe(
  //   map((response) => response.authenticated),
  //   catchError(() => of(false)) // En cas d'erreur, considérer que l'utilisateur n'est pas connecté
  // );
  return this.http.get<{ authenticated: boolean }>(`${this.apiUrl}sessionUser`, {
    headers: this.getAuthHeaders()
  }).pipe(
    map((response) => response.authenticated),
    catchError(() => of(false))
  );
}
// getUserInfo(): Observable<any> {
//   return this.http.get(`${this.apiUrl}sessionUser`).pipe(
//     catchError((error) => {
//       console.error('Failed to fetch user info:', error);
//       if (error.status === 401) {
//         return throwError(() => new Error('Unauthorized. Please log in again.'));
//       } else {
//         return throwError(() => new Error('Failed to fetch user information.'));
//       }
//     })
//   );
// }
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

  // saveDemandeAvecClient(formData: any): Observable<any> {
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   return this.http.post(`${this.apiUrl}saveDemande`, formData, { headers });
  // }
  saveDemandeAvecClient(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}saveDemande`, formData, {
      headers: this.getAuthHeaders()
    });
  }
  // getClientsWithDemande(): Observable<any> {
  //   return this.http.get<any>(`${this.apiUrl}listeClient`);
  // }
  getClientsWithDemande(): Observable<any> {
    return this.http.get(`${this.apiUrl}listeClient`, {
      headers: this.getAuthHeaders()
    });
  }
  // updateClient(client: any): Observable<any> {
  //   const url = `${this.apiUrl}updateClient/${client.id}`;
  //   return this.http.put<any>(url, client);
  // }
  updateClient(client: any): Observable<any> {
    return this.http.put(`${this.apiUrl}updateClient/${client.id}`, client, {
      headers: this.getAuthHeaders()
    });
  }

  // Delete client
  // deleteClient(clientId: number): Observable<any> {
  //   return this.http.delete<any>(`${this.apiUrl.replace(/\/$/, '')}/deleteClient/${clientId}`);


  // }
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

  // private getAuthHeaders(): HttpHeaders {
  //   const token = sessionStorage.getItem('auth_token'); // À adapter selon votre système
  //   return new HttpHeaders({
  //     'Authorization': `Bearer ${token}`
  //   });
  // }
  // private getAuthHeaders(): HttpHeaders {
  //   const token = this.getToken();
  //   let headers = new HttpHeaders().set('Content-Type', 'application/json');

  //   if (token) {
  //     headers = headers.set('Authorization', `Bearer ${token}`);
  //   }

  //   return headers;
  // }

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

  // updateDemande(updatedDemande: any): Observable<any> {
  //   const url = `${this.apiUrl}updateDemande/${updatedDemande.id}`;
  //   console.log("Données envoyées au backend :", updatedDemande); // Ajoutez ce log
  //   return this.http.put<any>(url, updatedDemande);
  // }
  
  updateDemande(updatedDemande: any): Observable<any> {
    return this.http.put(`${this.apiUrl}updateDemande/${updatedDemande.id}`, updatedDemande, {
      headers: this.getAuthHeaders()
    });
  }
//   deleteDemande(demandeId: number): Observable<any> {
//     return this.http.delete<any>(`${this.apiUrl.replace(/\/$/, '')}/deleteDemande/${demandeId}`);


// }
deleteDemande(demandeId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}deleteDemande/${demandeId}`, {
    headers: this.getAuthHeaders()
  });
}
// acceptDemande(demandeId: number): Observable<any> {
//   return this.http.put<any>(`${this.apiUrl}acceptDemande/${demandeId}`, {});
// }
acceptDemande(demandeId: number): Observable<any> {
  return this.http.put(`${this.apiUrl}acceptDemande/${demandeId}`, {}, {
    headers: this.getAuthHeaders()
  });
}
// cancelDemande(demandeId: number): Observable<any> {
//   return this.http.put<any>(`${this.apiUrl}cancelDemande/${demandeId}`, {});
// }
cancelDemande(demandeId: number): Observable<any> {
  return this.http.put(`${this.apiUrl}cancelDemande/${demandeId}`, {}, {
    headers: this.getAuthHeaders()
  });
}
// getTechnicien(): Observable<any> {
//   return this.http.get<any>(`${this.apiUrl}getTechnicien`);
// }
// updateTechnicien(id: number, user: any): Observable<any> {
//   const url = `${this.apiUrl}updateTechnicien/${id}`;
//   return this.http.put(url, user);
// }
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
// Dans votre AuthService
// desactiverUser(id: number): Observable<any> {
//   return this.http.delete(`${this.apiUrl}desactiveUser/${id}`);
// }

// activeUser(id: number): Observable<any> {
//   return this.http.put(`${this.apiUrl}activateUser/${id}`, {});
// }
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
// getCommercial(): Observable<any> {
//   return this.http.get<any>(`${this.apiUrl}getCommercial`);
// }
// updateCommercial(id: number, user: any): Observable<any> {
//   const url = `${this.apiUrl}updateCommercial/${id}`;
//   return this.http.put(url, user);
// }
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
// createAffectation(data: any) {
//   return this.http.post(`${this.apiUrl}createAffectation`, data);
// }
createAffectation(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}createAffectation`, data, {
    headers: this.getAuthHeaders()
  });
}
// getAffectationsForTechnicien(email: string): Observable<any[]> {
//   const params = new HttpParams().set('email', email);
  
//   return this.http.get<any[]>(`${this.apiUrl}getAffectationss`, {
//     params,
//     headers: this.getAuthHeaders()
//   }).pipe(
//     catchError(this.handleError)
//   );
// }
getAffectationsForTechnicien(email: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}getAffectationss`, {
    params: { email },
    headers: this.getAuthHeaders()
  });
}

// getAffectations(filters: any): Observable<any> {
//   const params = new HttpParams({ fromObject: filters });
//   return this.http.get<any>(`${this.apiUrl}getAffectation`, { params });
// }
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
// createIntervention(data: any): Observable<any> {
//   return this.http.post(`${this.apiUrl}intervention`, data);
// }
createIntervention(data: { affectation_id: number; observation: string; taches: number[] }): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}intervention`, data, {
    headers: this.getAuthHeaders()
  });
}
}

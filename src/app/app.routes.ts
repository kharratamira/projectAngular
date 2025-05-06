
import { Routes } from '@angular/router';
import { AccueillComponent } from './components/accueill/accueill.component';
import { DemandeInterventionComponent } from './components/demande-intervention/demande-intervention.component';
import { ListeClientsComponent } from './components/liste-clients/liste-clients.component';
import { ListeDemandeComponent } from './components/liste-demande/liste-demande.component';
import { LoginComponent } from './components/login/login.component';
//import { SingupComponent } from './components/singup/singup.component';
import { DashbordComponent } from './components/dashbord/dashbord.component';
import { AjouterUserComponent } from './components/ajouter-user/ajouter-user.component';
import { AuthGuard } from './services/core/guards/AuthGuard';
import { RoleGuard } from './services/core/guards/RoleGuard ';
import { ListeCompteComponent } from './components/liste-compte/liste-compte.component';
import { ListeCommercialComponent } from './components/liste-commercial/liste-commercial.component';
import { AffecterDemandeComponent } from './components/affecter-demande/affecter-demande.component';
import { PlanningComponent } from './components/planning/planning.component';
import { AutorisationSortieComponent } from './components/autorisation-sortie/autorisation-sortie.component';
import { DemandeAutorisationSortieComponent } from './components/demande-autorisation-sortie/demande-autorisation-sortie.component';
import { ListeInterventionComponent } from './components/liste-intervention/liste-intervention.component';
import { DemandeContratComponent } from './components/demande-contrat/demande-contrat.component';
import { ListedemandeContratComponent } from './components/listedemande-contrat/listedemande-contrat.component';

export const routes: Routes = [
  { path: 'acceuil', component: AccueillComponent },
  { path: '', redirectTo: '/acceuil', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: DashbordComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'listeClients',
        component: ListeClientsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'listeDemande',
        component: ListeDemandeComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CLIENT'] }
      },
      {
        path: 'demande-intervention',
        component: DemandeInterventionComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_CLIENT','ROLE_ADMIN'] }
      },
      {
        path: 'AjouterUser',
        component: AjouterUserComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'liste_compte',
        component: ListeCompteComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'liste_Commercial',
        component: ListeCommercialComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      // {
      //   path: 'signup',
      //   component: SingupComponent,
      //   canActivate: [RoleGuard],
      //   data: { roles: ['ROLE_ADMIN'] }
      // },
      {
        path: 'affecterDemande/:id',
        component: AffecterDemandeComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {path: 'planing',
        component: PlanningComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_TECHNICIEN'] }},
      {path: 'autorisationSortie',
          component: AutorisationSortieComponent,
          canActivate: [RoleGuard],
          data: { roles: ['ROLE_TECHNICIEN'] }},

        {path: 'listeautorisationSortie',
            component: DemandeAutorisationSortieComponent,
            canActivate: [RoleGuard],
            data: { roles: ['ROLE_TECHNICIEN','ROLE_ADMIN'] }},
        {path: 'listeIntervention',
              component: ListeInterventionComponent,
              canActivate: [RoleGuard],
              data: { roles: ['ROLE_CLIENT','ROLE_ADMIN','ROLE_TECHNICIEN'] }},
        {path: 'demandeContrat',
                component: DemandeContratComponent,
                canActivate: [RoleGuard],
                data: { roles: ['ROLE_CLIENT'] }},
        {path: 'ListedemandeContrat',
         component: ListedemandeContratComponent,
          canActivate: [RoleGuard],
          data: { roles: ['ROLE_CLIENT','ROLE_ADMIN'] }},
    ]
  }
];
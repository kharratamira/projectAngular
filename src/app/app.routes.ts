// import { Routes } from '@angular/router';
// import { AccueillComponent } from './components/accueill/accueill.component';
// import { DemandeInterventionComponent } from './components/demande-intervention/demande-intervention.component';
// import { ListeClientsComponent } from './components/liste-clients/liste-clients.component';
// import { ListeDemandeComponent } from './components/liste-demande/liste-demande.component';
// import { LoginComponent } from './components/login/login.component';
// import { SingupComponent } from './components/singup/singup.component';
// import { DashbordComponent } from './components/dashbord/dashbord.component';
// import { AjouterUserComponent } from './components/ajouter-user/ajouter-user.component';
// import { AuthGuard } from './services/core/guards/AuthGuard';
// import { ListeCompteComponent } from './components/liste-compte/liste-compte.component';
// import { ListeCommercialComponent } from './components/liste-commercial/liste-commercial.component';
// import { AffecterDemandeComponent } from './components/affecter-demande/affecter-demande.component';

// export const routes: Routes = [
//   { path: 'acceuil', component: AccueillComponent },

//   // { path: 'listeClients', component: ListeClientsComponent },
//   //{ path: 'listeDemande', component: ListeDemandeComponent },
//   { path: '', redirectTo: '/acceuil', pathMatch: 'full' },

//   { path: 'login', component: LoginComponent },
//   // { path: 'demande-intervention', component: DemandeInterventionComponent },
//   // { path: 'listeDemande', component: ListeDemandeComponent },

//   {
//     path: 'dashboard',
//     component: DashbordComponent,
//     //canActivate: [AuthGuard],
//     children: [
//       //{ path: '', redirectTo: 'acceuil', pathMatch: 'full' },
//       // { path: 'acceuil', component: AccueillComponent },
//       { path: 'listeClients', component: ListeClientsComponent },
//       { path: 'listeDemande', component: ListeDemandeComponent },
//       { path: 'demande-intervention', component: DemandeInterventionComponent },
//       { path: 'AjouterUser', component: AjouterUserComponent },
//       { path: 'liste_compte', component: ListeCompteComponent },
//       { path: 'liste_Commercial', component: ListeCommercialComponent },
//       { path: 'signup', component: SingupComponent },
//       {path: 'affecterDemande', component: AffecterDemandeComponent},

//     ]
//   }

// ];
import { Routes } from '@angular/router';
import { AccueillComponent } from './components/accueill/accueill.component';
import { DemandeInterventionComponent } from './components/demande-intervention/demande-intervention.component';
import { ListeClientsComponent } from './components/liste-clients/liste-clients.component';
import { ListeDemandeComponent } from './components/liste-demande/liste-demande.component';
import { LoginComponent } from './components/login/login.component';
import { SingupComponent } from './components/singup/singup.component';
import { DashbordComponent } from './components/dashbord/dashbord.component';
import { AjouterUserComponent } from './components/ajouter-user/ajouter-user.component';
import { AuthGuard } from './services/core/guards/AuthGuard';
import { RoleGuard } from './services/core/guards/RoleGuard ';
import { ListeCompteComponent } from './components/liste-compte/liste-compte.component';
import { ListeCommercialComponent } from './components/liste-commercial/liste-commercial.component';
import { AffecterDemandeComponent } from './components/affecter-demande/affecter-demande.component';

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
      {
        path: 'signup',
        component: SingupComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'affecterDemande',
        component: AffecterDemandeComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      }
    ]
  }
];
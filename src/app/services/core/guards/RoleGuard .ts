import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = route.data['roles'] as Array<string>;
    const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    
    const hasRole = expectedRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    
    return true;
  }
}
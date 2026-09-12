import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.authService.getToken();
    
    if (!token) {
      this.router.navigate(['/']);
      return false;
    }

    const userRole = this.authService.extractRoleFromToken(token);
    const requiredRole = route.data['role'];

    if (requiredRole && userRole !== requiredRole) {
      alert(`Access denied: ${requiredRole} role required`);
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
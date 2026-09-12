import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/user-management', pathMatch: 'full' },
  { path: 'user-management', loadComponent: () => import('./user-management/user-management').then(m => m.UserManagementComponent) },
  { path: 'doctor-availability', loadComponent: () => import('./doctor-availability/doctor-availabilty').then(m => m.DoctorAvailabilty) },
  { path: 'appointment-scheduling', loadComponent: () => import('./appointment-scheduling/appointment-scheduling').then(m => m.AppointmentScheduling) },
  { path: 'app-consultation-records', loadComponent: () => import('./consultation-records/consultation-records').then(m => m.ConsultationRecordsComponent) },
  { path: '**', redirectTo: '' }
];
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { ConfigService } from '../services/config.service';
 
export interface Appointment {
  id?: number;
  patientId: number;
  doctorId: number;
  date: string;
  slot: string;
  status?: string;
}
 
export interface AppointmentRequest {
  patientId: number;
  doctorId: number;
  date: string;
  slot: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  startTime: string;
  endTime: string;
  reason?: string;
}
 
export interface AppointmentUpdateRequest {
  appointmentId: number;
  newDate: string;
  newSlot: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  startTime: string;
  endTime: string;
  reason: string;
}
 
export interface AppointmentCancelInfo {
  patientName: string;
  doctorName: string;
  patientEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}
 
export interface UserDTO {
  id: number;
  name: string;
  email: string;
  specialisation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  constructor(private http: HttpClient, private config: ConfigService) {}
 
  bookAppointment(request: AppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.config.appointmentsApiUrl}/book`, request);
  }
 
  updateAppointment(id: number, request: AppointmentUpdateRequest): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.config.appointmentsApiUrl}/update/${id}`, request);
  }
 
  cancelAppointment(id: number, cancelInfo: AppointmentCancelInfo): Observable<any> {
    return this.http.delete<any>(`${this.config.appointmentsApiUrl}/cancel/${id}`, {
      body: cancelInfo,
      responseType: 'text' as 'json'
    });
  }

  getAppointmentsByPatient(patientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.config.appointmentsApiUrl}/patient/${patientId}`).pipe(
      catchError(error => {
        console.error('Patient appointments API error:', error);
        return of([]);
      })
    );
  }

  getAppointmentsByDoctor(doctorId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.config.appointmentsApiUrl}/doctor/${doctorId}`).pipe(
      catchError(error => {
        console.error('Doctor appointments API error:', error);
        return of([]);
      })
    );
  }

  getDoctorsBySpecialisation(specialisation: string): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.config.appointmentsApiUrl}/by-specialisation/${specialisation}`).pipe(
      catchError(error => {
        console.error('Doctors by specialisation API error:', error);
        return of([]);
      })
    );
  }

  getAvailableSlots(doctorId: number, date: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.config.appointmentsApiUrl}/available-slots/${doctorId}/${date}`).pipe(
      catchError(error => {
        console.error('Available slots API error:', error);
        return of([]);
      })
    );
  }
}
 
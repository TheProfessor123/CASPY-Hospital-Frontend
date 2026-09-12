import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface Appointment {
  id: number;
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

  cancelAppointment(id: number, cancelInfo: AppointmentCancelInfo): Observable<string> {
    return this.http.delete<string>(`${this.config.appointmentsApiUrl}/cancel/${id}`, {
      body: cancelInfo,
      responseType: 'text' as 'json'
    });
  }

  getAppointmentsByPatient(patientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.config.appointmentsApiUrl}/patient/${patientId}`);
  }
}

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ConsultationRecordsService, Consultation } from '../services/consultation-records';
import { AvailabilityService, Appointment } from '../doctor-availability/doctor-availabilty';

@Component({
  selector: 'app-consultation-records',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consultation-records.html',
  styleUrls: ['./consultation-records.css', '../shared/shared-styles.css']
})
export class ConsultationRecordsComponent implements OnInit, OnDestroy {
  private consultationService = inject(ConsultationRecordsService);
  private formBuilder = inject(FormBuilder);
  private availabilityService = inject(AvailabilityService);
  private destroy$ = new Subject<void>();

  consultationForm: FormGroup;
  
  consultations: Consultation[] = [];
  selectedPatientId: number | null = null;
  
  // Doctor appointments for autofill
  doctorAppointments: Appointment[] = [];
  selectedAppointment: Appointment | null = null;
  currentDoctorId: number = 0;
  
  // User role detection
  userRole: string | null = null;
  isDoctor: boolean = false;
  isPatient: boolean = false;
  currentPatientId: number = 0;
  
  errorMessage = '';
  successMessage = '';
  
  showAddForm = false;
  isLoading = false;
  isSubmitting = false;

  ngOnInit(): void {
    this.consultationForm = this.formBuilder.group({
      notes: ['', [Validators.required, Validators.maxLength(1000)]],
      prescription: ['', [Validators.required, Validators.maxLength(1000)]],
      appointmentId: ['', [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      patientId: ['', [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]]
    });

    this.consultationService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    this.consultationService.submitting$
      .pipe(takeUntil(this.destroy$))
      .subscribe(submitting => this.isSubmitting = submitting);

    this.consultationForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.clearMessages());

    // Load user info and initialize based on role
    this.loadCurrentDoctorInfo();
    this.initializeForUserRole();
  }

  initializeForUserRole(): void {
    // For patients, automatically load their medical history
    // For doctors, they need to manually search for patient records
    if (this.isPatient && this.currentPatientId > 0) {
      // Auto-load patient's own medical history
      setTimeout(() => {
        this.viewMedicalHistory(this.currentPatientId, false);
      }, 500);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  saveConsultation(): void {
    if (this.consultationForm.valid) {
      this.clearMessages();
      const consultation: Consultation = this.consultationForm.value;

      this.consultationService.saveConsultation(consultation)
        .pipe(takeUntil(this.destroy$)) // Automatically unsubscribe on component destroy
        .subscribe({
          next: (response) => {
            this.successMessage = response;
            this.consultationForm.reset();
            this.showAddForm = false;
            
            if (this.selectedPatientId === consultation.patientId) {
              this.refreshMedicalHistory();
            }
          },
          error: (error) => {
            this.errorMessage = error.message;
          }
        });
    } else {
      this.markFormGroupTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  onSearchClick(patientIdValue: string): void {
    this.clearMessages();
    
    if (!patientIdValue || patientIdValue.trim() === '') {
      this.errorMessage = 'Please enter a Patient ID';
      return;
    }
    
    const patientId = parseInt(patientIdValue.trim(), 10);
    
    if (isNaN(patientId) || patientId <= 0) {
      this.errorMessage = 'Please enter a valid positive number for Patient ID';
      return;
    }
    
    this.viewMedicalHistory(patientId, false);
  }

  viewMedicalHistory(patientId: number, forceRefresh: boolean = false): void {
    if (!patientId || patientId <= 0) {
      this.errorMessage = 'Please enter a valid Patient ID (positive number)';
      return;
    }

    this.clearMessages();
    this.selectedPatientId = patientId;

    this.consultationService.getMedicalHistory(patientId, forceRefresh)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (consultations) => {
          this.consultations = consultations;
          
          if (consultations.length === 0) {
            this.errorMessage = `No consultation records found for Patient ID: ${patientId}`;
          } else {
            this.successMessage = `Found ${consultations.length} consultation record(s) for Patient ID: ${patientId}`;
          }
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.consultations = []; 
        }
      });
  }

  onSubmit(): void {
    this.saveConsultation();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.consultationForm.reset();
      this.clearMessages();
    }
  }

  refreshMedicalHistory(): void {
    if (this.selectedPatientId) {
      this.viewMedicalHistory(this.selectedPatientId, true);
    }
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  loadCurrentDoctorInfo(): void {
    // Get user info from JWT token
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userRole = payload.role || payload.user_type;
        this.isDoctor = this.userRole === 'DOCTOR';
        this.isPatient = this.userRole === 'PATIENT';
        
        // Handle role-specific initialization
        if (this.isDoctor) {
          this.currentDoctorId = payload.id || payload.userId || 0;
          
          if (this.currentDoctorId > 0) {
            this.loadDoctorAppointments();
          }
        } else if (this.isPatient) {
          this.currentPatientId = payload.id || payload.userId || 0;
        }
      } catch (error) {
        console.error('Error parsing JWT token:', error);
      }
    }
  }

  loadDoctorAppointments(): void {
    console.log('Loading appointments for doctor ID:', this.currentDoctorId);
    this.availabilityService.getAppointmentsByDoctor(this.currentDoctorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments) => {
          this.doctorAppointments = appointments;
          console.log('Successfully loaded appointments:', appointments.length);
        },
        error: (error) => {
          console.error('Error loading doctor appointments:', error);
          console.error('Full error details:', error);
        }
      });
  }

  onAppointmentSelect(appointmentId: string): void {
    const selectedId = parseInt(appointmentId, 10);
    this.selectedAppointment = this.doctorAppointments.find(apt => apt.id === selectedId) || null;
    
    if (this.selectedAppointment) {
      // Autofill appointment ID and patient ID
      this.consultationForm.patchValue({
        appointmentId: this.selectedAppointment.id,
        patientId: this.selectedAppointment.patientId
      });
    }
  }

  trackByConsultationId(index: number, consultation: Consultation): number {
    return consultation.consultationId || index;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.consultationForm.controls).forEach(key => {
      this.consultationForm.get(key)?.markAsTouched();
    });
  }

  get f() {
    return this.consultationForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.consultationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.consultationForm.get(fieldName);
    if (!field?.errors) { return ''; }

    const displayName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

    if (field.errors['required']) {
      return `${displayName} is required.`;
    }
    if (field.errors['minlength']) {
        const { requiredLength } = field.errors['minlength'];
        return `${displayName} must be at least ${requiredLength} characters.`;
    }
    if (field.errors['maxlength']) {
      const { requiredLength } = field.errors['maxlength'];
      return `${displayName} cannot exceed ${requiredLength} characters.`;
    }
    if (field.errors['min']) {
      return `${displayName} must be a positive number.`;
    }
    if (field.errors['pattern']) {
      return `Please enter a valid number for ${displayName}.`;
    }
    
    return '';
  }
}
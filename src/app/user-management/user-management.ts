import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ConsultationRecordsComponent } from '../consultation-records/consultation-records';
import { ConsultationRecordsService } from '../services/consultation-records';
import { AppointmentScheduling } from '../appointment-scheduling/appointment-scheduling';
import { DoctorAvailabilty } from '../doctor-availability/doctor-availabilty';
import { AppointmentService } from '../appointment-scheduling/appointment.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ConsultationRecordsComponent, AppointmentScheduling, DoctorAvailabilty],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagementComponent implements OnInit {
  currentView = 'login';
  userName = 'John Doe';
  registrationSuccess = false;
  userRole: string | null = null;
  userEmail = '';
  userPhone = '';
  userAge = 0;
  userId = 0;
  showLoginPassword = false;
  showDoctorPassword = false;
  doctorStats = {
    totalPatients: 0,
    todayAppointments: 0,
    weeklyConsultations: 0,
    rating: 0
  };
  
  patientHealthSummary = {
    lastVisit: null as any,
    currentMedications: [] as any[],
    vitalSigns: null as any
  };
  
  todaysSchedule: any[] = [];
  doctorProfile: any = {
    specialization: '',
    experience: '',
    qualification: ''
  };
  
  // Validation properties
  loginData = {
    email: '',
    password: ''
  };
  
  validationErrors = {
    registration: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      password: ''
    },
    login: {
      email: '',
      password: ''
    },
    doctorLogin: {
      email: '',
      password: ''
    }
  };

  constructor(private authService: AuthService, private consultationService: ConsultationRecordsService, private router: Router, private appointmentService: AppointmentService) {}

  ngOnInit() {
    this.checkExistingAuth();
  }

  checkExistingAuth() {
    const token = this.authService.getToken();
    if (token) {
      const role = this.authService.extractRoleFromToken(token);
      this.userName = this.authService.extractUserNameFromToken(token) || 'User';
      this.userRole = role;
      this.extractUserInfoFromToken(token);
      
      if (role === 'DOCTOR' || role === 'ADMIN') {
        this.loadDoctorStats();
        this.currentView = 'doctor-dashboard';
      } else if (role === 'PATIENT') {
        this.loadPatientHealthSummary();
        this.currentView = 'dashboard';
      }
    }
  }
  
  registrationData = {
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: ''
  };

  doctorLoginData = {
    email: '',
    password: ''
  };

  showLogin() {
    this.currentView = 'login';
    this.registrationSuccess = false;
  }

  showRegister() {
    this.currentView = 'register';
    this.registrationSuccess = false;
  }

  showAbout() {
    this.currentView = 'about';
    this.scrollToAbout();
  }

  showCardiology() {
    this.currentView = 'cardiology';
    this.scrollToCardiology();
  }

  showNeurology() {
    this.currentView = 'neurology';
    this.scrollToNeurology();
  }

  showOrthopedics() {
    this.currentView = 'orthopedics';
    this.scrollToOrthopedics();
  }

  showPediatrics() {
    this.currentView = 'pediatrics';
    this.scrollToPediatrics();
  }

  showDoctorLogin() {
    this.currentView = 'doctor-login';
    this.scrollToDoctorLogin();
  }

  showEmergencyContact() {
    this.currentView = 'emergency-contact';
    this.scrollToEmergencyContact();
  }

  doctorLogin() {
    this.clearValidationErrors('doctorLogin');
    
    if (this.validateDoctorLogin()) {
      this.authService.login(this.doctorLoginData.email, this.doctorLoginData.password).subscribe({
        next: (token) => {
          this.authService.saveToken(token);
          this.userRole = this.authService.extractRoleFromToken(token);
          this.userName = this.authService.extractUserNameFromToken(token) || 'Doctor';
          this.userEmail = this.doctorLoginData.email;
          this.extractUserInfoFromToken(token);
          
          // Try to get user data by email if phone not available
          if (!this.userPhone && this.userEmail) {
            this.fetchUserDataByEmail(this.userEmail);
          }
          
          if (this.canAccessDoctorDashboard()) {
            this.loadDoctorStats();
            this.currentView = 'doctor-dashboard';
            this.scrollToDoctorDashboard();
          }
        },
        error: (error) => {
          console.error('Doctor login error:', error);
          if (error.status === 0) {
            this.validationErrors.doctorLogin.email = 'Cannot connect to backend. Check if backend is running on port 8081.';
          } else if (error.status === 401) {
            this.validationErrors.doctorLogin.email = 'Invalid doctor credentials. Please check your email and password.';
          } else {
            this.validationErrors.doctorLogin.email = 'Doctor login failed: ' + (error.error?.message || 'Connection error');
          }
        }
      });
    }
  }



  showCreateConsultation() {
    this.currentView = 'consultation-records';
    this.scrollToConsultationRecords();
  }

  showCreateAvailability() {
    console.log('Set Availability button clicked');
    console.log('Current view before:', this.currentView);
    console.log('User role:', this.userRole);
    
    // Force the view change
    this.currentView = 'doctor-availability';
    console.log('Current view after:', this.currentView);
    
    // Add a longer timeout to ensure the view has time to render
    setTimeout(() => {
      this.scrollToDoctorAvailability();
    }, 200);
  }

  scrollToDoctorAvailability() {
    setTimeout(() => {
      const element = document.getElementById('doctor-availability');
      console.log('Looking for doctor-availability element:', element);
      if (element) {
        console.log('Found element, scrolling to it');
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.log('doctor-availability element not found');
      }
    }, 100);
  }

  scrollToConsultationRecords() {
    setTimeout(() => {
      const element = document.getElementById('consultation-records');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  goBackFromConsultation() {
    if (this.userRole === 'DOCTOR' || this.userRole === 'ADMIN') {
      this.currentView = 'doctor-dashboard';
      this.scrollToDoctorDashboard();
    } else {
      this.currentView = 'dashboard';
      this.scrollToDashboard();
    }
  }

  register() {
    this.clearValidationErrors('registration');
    
    if (this.validateRegistration()) {
      const age = this.calculateAge(this.registrationData.dateOfBirth);
      
      const userData = {
        name: this.registrationData.fullName,
        userEmail: this.registrationData.email,
        phone: this.registrationData.phone,
        age: age.toString(),
        password: this.registrationData.password,
        role: 'PATIENT'
      };
      
      this.authService.register(userData).subscribe({
        next: (response) => {
          this.userName = this.registrationData.fullName;
          this.registrationSuccess = true;
          
          // Auto-login after successful registration
          setTimeout(() => {
            this.authService.login(this.registrationData.email, this.registrationData.password).subscribe({
              next: (token) => {
                this.authService.saveToken(token);
                this.userRole = this.authService.extractRoleFromToken(token);
                this.userName = this.authService.extractUserNameFromToken(token) || this.registrationData.fullName;
                this.extractUserInfoFromToken(token);
                this.currentView = 'dashboard';
                this.scrollToDashboard();
              },
              error: (error) => {
                // If auto-login fails, just show login form
                this.currentView = 'login';
              }
            });
          }, 2000);
        },
        error: (error) => {
          console.error('Registration error details:', error);
          if (error.message.includes('Cannot connect to backend')) {
            this.validationErrors.registration.email = 'Cannot connect to backend server. Please ensure the backend is running on port 8081.';
          } else {
            this.validationErrors.registration.email = 'Registration failed: ' + error.message;
          }
        }
      });
    }
  }

  login() {
    this.clearValidationErrors('login');
    
    if (this.validateLogin()) {
      this.authService.login(this.loginData.email, this.loginData.password).subscribe({
        next: (token) => {
          this.authService.saveToken(token);
          this.userRole = this.authService.extractRoleFromToken(token);
          this.userName = this.authService.extractUserNameFromToken(token) || 'Patient';
          this.userEmail = this.loginData.email;
          this.extractUserInfoFromToken(token);
          // Ensure email is preserved if not in token
          if (!this.userEmail) {
            this.userEmail = this.loginData.email;
          }
          // Generate patient ID if not set
          if (this.userId === 0 && this.userEmail) {
            this.userId = this.generatePatientId(this.userEmail);
          }
          
          // Try to get user data by email if phone not available
          if (!this.userPhone && this.userEmail) {
            this.fetchUserDataByEmail(this.userEmail);
          }
          
          if (this.canAccessPatientDashboard()) {
            this.loadPatientHealthSummary();
            this.currentView = 'dashboard';
            this.scrollToDashboard();
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          if (error.status === 0) {
            this.validationErrors.login.email = 'Cannot connect to backend. Check if backend is running on port 8081.';
          } else if (error.status === 401) {
            this.validationErrors.login.email = 'Invalid email or password. Please check your credentials.';
          } else {
            this.validationErrors.login.email = 'Login failed: ' + (error.error || error.message || 'Please try again.');
          }
        }
      });
    }
  }

  showHome() {
    this.currentView = 'login';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showAppointmentHistory() {
    this.currentView = 'appointment-management';
    this.scrollToAppointmentManagement();
  }

  showMedicalHistory() {
    this.currentView = 'consultation-records';
    this.scrollToConsultationRecords();
    
    // Auto-load medical history for current patient
    setTimeout(() => {
      if (this.userId > 0) {
        this.loadMedicalHistoryForPatient(this.userId);
      }
    }, 1000);
  }



  scrollToLogin() {
    setTimeout(() => {
      const element = document.getElementById('user-management');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  scrollToDashboard() {
    setTimeout(() => {
      const element = document.getElementById('dashboard');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  scrollToAbout() {
    setTimeout(() => {
      const element = document.getElementById('about');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  scrollToServices() {
    setTimeout(() => {
      const element = document.getElementById('services');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  scrollToCardiology() {
    setTimeout(() => {
      const element = document.getElementById('cardiology');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  scrollToNeurology() {
    setTimeout(() => {
      const element = document.getElementById('neurology');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  scrollToOrthopedics() {
    setTimeout(() => {
      const element = document.getElementById('orthopedics');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  scrollToPediatrics() {
    setTimeout(() => {
      const element = document.getElementById('pediatrics');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  scrollToDoctorLogin() {
    setTimeout(() => {
      const element = document.getElementById('doctor-login');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  scrollToDoctorDashboard() {
    setTimeout(() => {
      const element = document.getElementById('doctor-dashboard');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  scrollToContact() {
    setTimeout(() => {
      const element = document.getElementById('contact');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }
  
  scrollToAppointmentManagement() {
    setTimeout(() => {
      const element = document.getElementById('appointment-management');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  scrollToEmergencyContact() {
    setTimeout(() => {
      const element = document.getElementById('emergency-contact');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }
  
  loadMedicalHistoryForPatient(patientId: number) {
    this.consultationService.getMedicalHistory(patientId).subscribe({
      next: (consultations) => {
      },
      error: (error) => {
        console.error('Error loading medical history:', error);
      }
    });
  }
  
  // Validation methods
  validateRegistration(): boolean {
    let isValid = true;
    
    // Full Name validation
    if (!this.registrationData.fullName.trim()) {
      this.validationErrors.registration.fullName = 'Full name is required';
      isValid = false;
    } else if (this.registrationData.fullName.trim().length < 2) {
      this.validationErrors.registration.fullName = 'Full name must be at least 2 characters';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(this.registrationData.fullName)) {
      this.validationErrors.registration.fullName = 'Full name can only contain letters and spaces';
      isValid = false;
    }
    
    // Email validation
    if (!this.registrationData.email.trim()) {
      this.validationErrors.registration.email = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.registrationData.email)) {
      this.validationErrors.registration.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Phone validation
    if (!this.registrationData.phone.trim()) {
      this.validationErrors.registration.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^[6-9]\d{9}$/.test(this.registrationData.phone)) {
      this.validationErrors.registration.phone = 'Please enter a valid 10-digit Indian mobile number';
      isValid = false;
    }
    
    // Date of Birth validation
    if (!this.registrationData.dateOfBirth) {
      this.validationErrors.registration.dateOfBirth = 'Date of birth is required';
      isValid = false;
    } else {
      const birthDate = new Date(this.registrationData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (birthDate > today) {
        this.validationErrors.registration.dateOfBirth = 'Date of birth cannot be in the future';
        isValid = false;
      } else if (age > 120) {
        this.validationErrors.registration.dateOfBirth = 'Please enter a valid date of birth';
        isValid = false;
      }
    }
    
    // Password validation
    if (!this.registrationData.password) {
      this.validationErrors.registration.password = 'Password is required';
      isValid = false;
    } else if (this.registrationData.password.length < 8) {
      this.validationErrors.registration.password = 'Password must be at least 8 characters long';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.registrationData.password)) {
      this.validationErrors.registration.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      isValid = false;
    }
    
    return isValid;
  }
  
  validateLogin(): boolean {
    let isValid = true;
    
    if (!this.loginData.email.trim()) {
      this.validationErrors.login.email = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.loginData.email)) {
      this.validationErrors.login.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!this.loginData.password) {
      this.validationErrors.login.password = 'Password is required';
      isValid = false;
    }
    
    return isValid;
  }
  
  validateDoctorLogin(): boolean {
    let isValid = true;
    
    if (!this.doctorLoginData.email.trim()) {
      this.validationErrors.doctorLogin.email = 'Doctor ID/Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.doctorLoginData.email)) {
      this.validationErrors.doctorLogin.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!this.doctorLoginData.password) {
      this.validationErrors.doctorLogin.password = 'Password is required';
      isValid = false;
    }
    
    return isValid;
  }
  
  isValidEmail(email: string): boolean {
    // Enhanced email pattern for healthcare application
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Additional checks for professional email format
    if (!emailRegex.test(email)) return false;
    
    // Check for consecutive dots
    if (email.includes('..')) return false;
    
    // Check for valid domain length
    const domain = email.split('@')[1];
    if (domain.length < 4 || domain.length > 253) return false;
    
    // Check for valid local part length
    const localPart = email.split('@')[0];
    if (localPart.length < 1 || localPart.length > 64) return false;
    
    return true;
  }
  
  clearValidationErrors(formType: 'registration' | 'login' | 'doctorLogin') {
    if (formType === 'registration') {
      this.validationErrors.registration = {
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        password: ''
      };
    } else if (formType === 'login') {
      this.validationErrors.login = {
        email: '',
        password: ''
      };
    } else if (formType === 'doctorLogin') {
      this.validationErrors.doctorLogin = {
        email: '',
        password: ''
      };
    }
  }
  
  // Role-based access control methods
  canAccessDoctorDashboard(): boolean {
    const token = this.authService.getToken();
    if (!token) {
      alert('Please login first');
      this.showLogin();
      return false;
    }
    
    const role = this.authService.extractRoleFromToken(token);
    if (role !== 'DOCTOR') {
      if (role === 'PATIENT') {
        alert('Access denied: This is the doctor portal. Please use the patient login form to access patient features.');
        this.resetUserData(); // Clear all user data and token
        this.showHome();
      } else {
        alert('Access denied: Doctor role required');
        this.resetUserData(); // Clear all user data and token
        this.showHome();
      }
      return false;
    }
    
    return true;
  }
  
  canAccessPatientDashboard(): boolean {
    const token = this.authService.getToken();
    if (!token) {
      alert('Please login first');
      this.showLogin();
      return false;
    }
    
    const role = this.authService.extractRoleFromToken(token);
    if (role !== 'PATIENT') {
      if (role === 'DOCTOR' || role === 'ADMIN') {
        alert('Access denied: This is the patient login portal. Please use the "Doctor Portal" button to access doctor features.');
        this.resetUserData(); // Clear all user data and token
        this.showHome();
      } else {
        alert('Access denied: Patient role required');
        this.resetUserData(); // Clear all user data and token
        this.showHome();
      }
      return false;
    }
    
    return true;
  }
  
  calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  generatePatientId(email: string): number {
    // Generate a consistent ID based on email hash
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Ensure positive number between 10000-99999
    return Math.abs(hash % 90000) + 10000;
  }

  extractUserInfoFromToken(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userEmail = payload.sub || payload.email || this.userEmail;
      this.userName = payload.name || this.userName;
      this.userPhone = payload.phone || '';
      this.userAge = payload.age || 0;
      
      // Generate consistent ID from email
      if (this.userEmail) {
        this.userId = this.generatePatientId(this.userEmail);
      }
      

    } catch (error) {
      console.error('Error extracting user info from token:', error);
    }
  }

  fetchUserDataByPhone(phone: string) {
    this.authService.getUserByPhone(phone).subscribe({
      next: (userData) => {
        if (userData) {
          this.userId = userData.id;
          this.userName = userData.name;
          this.userEmail = userData.userEmail;
          this.userPhone = userData.phone?.toString();
          this.userAge = userData.age;
          this.userRole = userData.user_type;
          console.log('Updated user data from phone API:', userData);
        }
      },
      error: (error) => {
        console.error('Error fetching user data by phone:', error);
      }
    });
  }

  fetchUserDataByEmail(email: string) {
    // Since we don't have a direct email endpoint, we'll try common phone patterns
    // or use the existing user data from registration/login
    console.log('Fetching user data for email:', email);
  }

  loadPatientHealthSummary() {
    if (this.userId > 0) {
      this.consultationService.getMedicalHistory(this.userId).subscribe({
        next: (consultations) => {
          if (consultations && consultations.length > 0) {
            // Get the most recent consultation
            const lastConsultation = consultations[0];
            this.patientHealthSummary.lastVisit = lastConsultation;
            
            // Extract medications from the last consultation
            if (lastConsultation.prescription) {
              this.patientHealthSummary.currentMedications = lastConsultation.prescription.split(',').map((med: string) => med.trim());
            }
            
            // Set default vital signs (consultation records don't include vital signs)
            this.patientHealthSummary.vitalSigns = {
              bloodPressure: '120/80 mmHg',
              heartRate: '72 bpm',
              temperature: '98.6°F',
              weight: '70 kg'
            };
          }
        },
        error: (error) => {
          console.error('Error loading patient health summary:', error);
        }
      });
    }
  }

  loadDoctorStats() {
    // Reset stats while loading
    this.doctorStats = {
      totalPatients: 0,
      todayAppointments: 0,
      weeklyConsultations: 0,
      rating: 0
    };
    
    if (this.userId > 0) {
      // Load doctor's appointments to calculate stats
      this.appointmentService.getAppointmentsByDoctor(this.userId).subscribe({
        next: (appointments) => {
          this.calculateDoctorStats(appointments);
        },
        error: (error) => {
          console.error('Error loading doctor appointments:', error);
        }
      });
      
      // Load doctor profile data from backend
      this.loadDoctorProfile();
    }
  }

  calculateDoctorStats(appointments: any[]) {
    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Count unique patients
    const uniquePatients = new Set(appointments.map(apt => apt.patientId));
    this.doctorStats.totalPatients = uniquePatients.size;
    
    // Get today's appointments
    const todaysAppointments = appointments.filter(apt => apt.date === today);
    this.doctorStats.todayAppointments = todaysAppointments.length;
    
    // Store today's schedule
    this.todaysSchedule = todaysAppointments.map(apt => ({
      ...apt,
      patientName: `Patient #${apt.patientId}`,
      status: this.getAppointmentStatus(apt.slot)
    }));
    
    // Count weekly consultations (appointments in last 7 days)
    this.doctorStats.weeklyConsultations = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= oneWeekAgo && aptDate <= new Date();
    }).length;
    
    // Set a default rating (could be enhanced with actual rating system)
    this.doctorStats.rating = 4.8;
  }

  loadDoctorProfile() {
    // Get email from JWT token subject
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.sub || payload.email;
    
                if (userEmail && userEmail.trim() !== '') {
          this.authService.getUserByEmail(userEmail).subscribe({
            next: (doctor) => {
              if (doctor) {
                
            // Update user info with real database data
            this.userId = doctor.id;
            this.userName = doctor.name || this.userName;
                this.userEmail = doctor.userEmail || this.userEmail;
            this.userPhone = doctor.phone?.toString() || this.userPhone;
                this.userAge = doctor.age || this.userAge;
            
                // Set doctor profile with real data (remove dummy fields)
            this.doctorProfile = {
                  specialization: doctor.specialisation || 'General Medicine'
            };
          }
        },
        error: (error) => {
              console.log('Could not load doctor profile from backend, using default values');
              this.setDefaultDoctorProfile();
        }
      });
    } else {
          console.log('No email available in JWT token, using default doctor profile');
          this.setDefaultDoctorProfile();
        }
      } catch (error) {
        console.error('Error parsing JWT token:', error);
        this.setDefaultDoctorProfile();
      }
    } else {
      console.log('No token available, using default doctor profile');
      this.setDefaultDoctorProfile();
    }
  }

  private setDefaultDoctorProfile() {
      this.doctorProfile = {
      specialization: 'General Medicine'
      };
  }

  getAppointmentStatus(slot: string): string {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const slotTime = parseInt(slot.replace(':', ''));
    
    if (slotTime < currentTime - 100) {
      return 'Completed';
    } else if (slotTime <= currentTime + 30) {
      return 'In Progress';
    } else {
      return 'Upcoming';
    }
  }



  resetUserData() {
    this.authService.removeToken();
    this.userRole = null;
    this.userName = 'John Doe';
    this.userEmail = '';
    this.userPhone = '';
    this.userAge = 0;
    this.userId = 0;
    this.doctorStats = {
      totalPatients: 0,
      todayAppointments: 0,
      weeklyConsultations: 0,
      rating: 0
    };
    this.doctorProfile = {
      specialization: ''
    };
  }

  logout() {
    this.resetUserData();
    this.currentView = 'login';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

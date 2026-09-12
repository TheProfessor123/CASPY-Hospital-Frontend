import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly baseUrl = 'https://gateway-flux.onrender.com';

  get apiBaseUrl(): string {
    return this.baseUrl;
  }

  get authApiUrl(): string {
    return `${this.baseUrl}/auth`;
  }

  get appointmentsApiUrl(): string {
    return `${this.baseUrl}/appointments`;
  }

  get consultationApiUrl(): string {
    return `${this.baseUrl}/consult`;
  }

  get availabilityApiUrl(): string {
    return `${this.baseUrl}/api/v1/availability`;
  }
} 
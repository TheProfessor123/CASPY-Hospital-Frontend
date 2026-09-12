import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip token attachment for login and register endpoints
  const isLoginOrRegister = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  
  if (isLoginOrRegister) {
    console.log('Skipping token for login/register:', req.url);
    return next(req);
  }

  // Get token from localStorage
  const token = localStorage.getItem('authToken');
  
  if (token) {
    console.log('Adding token to request:', req.url);
    // Clone the request and add the Authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(authReq);
  }

  console.log('No token found for request:', req.url);
  // If no token, pass the request as-is
  return next(req);
}; 
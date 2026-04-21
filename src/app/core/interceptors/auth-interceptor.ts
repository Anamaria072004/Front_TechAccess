import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache', // Evita que el navegador almacene en caché las respuestas
        'Pragma': 'no-cache', // Compatibilidad con HTTP/1.0
      }
    });
  }

  return next(req);
};

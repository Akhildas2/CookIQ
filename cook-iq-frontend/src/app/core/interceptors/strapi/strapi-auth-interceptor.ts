import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SupabaseService } from '../../services/supabase/supabase-service';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

export const strapiAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes(environment.strapi.url)) {
    return next(req)
  }
  const supabaseService = inject(SupabaseService);

  // Get current session token
  return from(supabaseService.client.auth.getSession()).pipe(
    switchMap(({ data }) => {
      const token = data.session?.access_token;

      // Clone request and add JWT token
      if (token) {
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next(clonedReq);
      }

      return next(req);
    })
  );
};
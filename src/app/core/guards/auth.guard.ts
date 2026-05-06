import { CanActivateFn } from '@angular/router';
import { createAuthGuard } from 'keycloak-angular';

export const authGuard: CanActivateFn = createAuthGuard(
  async (_, __, { authenticated, keycloak }) => {
    if (authenticated) return true;

    await keycloak.login({ redirectUri: window.location.origin + '/dashboard' });
    return false;
  }
);

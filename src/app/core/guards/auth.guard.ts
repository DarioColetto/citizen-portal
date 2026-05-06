import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const authGuard: CanActivateFn = async () => {
  const keycloak = inject(KeycloakService);

  const isLoggedIn = await keycloak.isLoggedIn();
  if (isLoggedIn) return true;

  await keycloak.login({ redirectUri: window.location.origin + '/dashboard' });
  return false;
};

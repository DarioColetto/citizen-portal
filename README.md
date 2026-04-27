# Portal Ciudadano

Portal de gestión de trámites ciudadanos con autenticación OAuth2/OIDC via Keycloak, construido con Angular 18.

## Stack

- **Angular 18** — standalone components, signals, nueva sintaxis `@if/@for/@switch`
- **Angular Material 18** — stepper, tables, chips, spinners, sidenav
- **Bootstrap 5** — layout de la vista pública de consulta
- **Keycloak Angular 16 + keycloak-js 25** — autenticación OAuth2/OIDC
- **RxJS 7** — `debounceTime`, `distinctUntilChanged`, `switchMap`
- **Formularios reactivos** — `FormGroup`, `FormArray`, validadores custom (DNI, email match, fileSize), validación cruzada
- **pdfmake** — comprobante de trámite descargable en PDF
- **ngx-image-compress** — compresión de documentos adjuntos
- **ngx-toastr** — notificaciones de estado
- **json-server** — mock API REST para desarrollo
- **Jest + jest-preset-angular** — tests unitarios
- **ESLint + Prettier + Husky + lint-staged** — calidad de código

## Estructura

```
src/app/
├── core/
│   ├── guards/          # authGuard (Keycloak)
│   ├── interceptors/    # authInterceptor (token Keycloak + errores)
│   ├── models/          # Tramite, TramiteFormValue
│   ├── services/        # TramiteService
│   └── validators/      # dniValidator, emailMatchValidator, fileSizeValidator
├── features/
│   ├── dashboard/       # Mis trámites con búsqueda RxJS
│   └── tramite/
│       ├── new/         # Stepper 4 pasos + FormArray de documentos + PDF receipt
│       └── status/      # Vista PÚBLICA: consulta por DNI sin login
├── layout/              # MainLayoutComponent con sidenav + logout Keycloak
└── environments/        # dev (Keycloak Docker local) / prod
```

## Correr el proyecto

### Sin Keycloak (modo desarrollo rápido)

```bash
npm install
npm run mock-api     # json-server en :3000
npm run start:dev    # Angular en :4200 con proxy
```

### Con Keycloak (Docker)

```bash
docker run -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:25.0 start-dev

# Crear realm: citizen-portal
# Crear client: citizen-portal-app (public, redirect: http://localhost:4200/*)
```

### Tests

```bash
npm test
npm run test:coverage
npm run lint
```

## Rutas

| Ruta | Acceso | Descripción |
|---|---|---|
| `/consulta` | Público | Consulta de estado por DNI |
| `/dashboard` | Autenticado | Lista de mis trámites |
| `/tramites/nuevo` | Autenticado | Formulario de nuevo trámite |

## Environments

| Ambiente | API URL | Keycloak |
|---|---|---|
| development | `http://localhost:3000` (proxy) | `http://localhost:8080` |
| production | `https://api.ciudadanos.gob.ar` | `https://auth.ciudadanos.gob.ar` |

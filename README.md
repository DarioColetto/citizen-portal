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

> Requiere Docker Desktop corriendo. En PowerShell usar una sola línea (no soporta `\` como continuación).

**1. Iniciar el contenedor**

Con persistencia de datos (recomendado — el realm y usuarios sobreviven reinicios):

```powershell
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin -v keycloak_data:/opt/keycloak/data quay.io/keycloak/keycloak:25.0 start-dev
```

Sin persistencia (los datos se pierden al detener el contenedor):

```powershell
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:25.0 start-dev
```

> Nota: Keycloak 25 usa `KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_PASSWORD`. Las variables `KC_BOOTSTRAP_ADMIN_*` son de Keycloak 26+.

Esperar hasta ver en el log: `Keycloak 25.0.6 ... started in ...s`

> Si aparece un error en la consola de admin al hacer login, recargá la página (F5) — es un bug transitorio de Keycloak 25.

**2. Crear el Realm**

1. Abrir `http://localhost:8080` → **Administration Console**
2. Login: `admin` / `admin`
3. Dropdown superior izquierdo (muestra "Keycloak") → **Create realm**
4. Realm name: `citizen-portal` → **Create**

**3. Crear el Client**

1. Menú izquierdo → **Clients** → **Create client**
2. Client ID: `citizen-portal-app` → **Next**
3. Client authentication: **OFF** (cliente público) → **Next**
4. Valid redirect URIs: `http://localhost:4200/*`
5. Web origins: `http://localhost:4200` → **Save**

**4. Crear un usuario de prueba**

1. Menú izquierdo → **Users** → **Add user**
2. Username: `testuser` → **Create**
3. Tab **Credentials** → **Set password** → ingresar contraseña, desactivar "Temporary" → **Save password**

**5. Correr la aplicación**

```bash
npm run mock-api     # json-server en :3000
npm run start:dev    # Angular en :4200 con proxy
```

### Tests

```bash
npm test
npm run test:coverage
npm run lint
```

## Diagrama de flujo

```mermaid
flowchart TD
    U([Usuario]) --> R{¿Ruta?}

    R -->|/consulta| PUB[Vista pública\nConsulta por DNI]
    R -->|/ · /dashboard\n/tramites/nuevo| G[authGuard]

    G -->|autenticado| ML[MainLayout\nSidenav + Toolbar]
    G -->|no autenticado| KC[Keycloak\nOAuth2 · OIDC]
    KC -->|token JWT| ML

    ML -->|interceptor adjunta\nBearer token| API[(json-server\n:3000)]
    ML --> NAV{Navegación}

    NAV -->|/dashboard| DB[DashboardComponent]
    NAV -->|/tramites/nuevo| NW[TramiteNewComponent]

    %% Dashboard
    DB --> DB1[loadUserProfile\nKeycloak]
    DB --> DB2[TramiteService.getAll]
    DB2 -->|GET /tramites| API
    API --> DB3[Tabla de trámites\nStats cards]
    DB --> DB4[searchControl\ndebounceTime 400ms\ndistinctUntilChanged\nswitchMap]
    DB4 -->|GET /tramites?q=| API

    %% Nuevo trámite
    NW --> ST[Stepper lineal]
    ST --> P1[Paso 1 · Datos personales\nDNI validator · email match]
    P1 --> P2[Paso 2 · Tipo de trámite\ntipo · título · descripción]
    P2 --> P3[Paso 3 · Documentos\nFormArray · ngx-image-compress]
    P3 --> P4[Paso 4 · Confirmación\nresumen del trámite]
    P4 --> SUB[TramiteService.create]
    SUB -->|POST /tramites| API
    API --> PDF[pdfmake\ncomprobante.pdf]
    API --> TST[ngx-toastr\nnotificación]
    TST --> DASH[Router → /dashboard]

    %% Vista pública
    PUB --> V1[dniControl\ndniValidator]
    V1 --> V2[TramiteService.getByDni]
    V2 -->|GET /tramites?applicantDni=| API
    API --> V3[Cards de resultado\ncon estado y observaciones]

    %% Logout
    ML --> LO[Keycloak logout\n→ /consulta]
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

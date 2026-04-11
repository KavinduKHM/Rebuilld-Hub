# rebuildhub-frontend

Frontend SPA for RebuildHub built with React. This application provides role-based dashboards and UI workflows for disasters, reports, aid, volunteers, weather, resources, and donations.

## 1. Local Setup Guide (Step by Step)

### 1.1 Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Running backend API at `http://localhost:5000`

### 1.2 Clone and Install

1. Open terminal.
2. Clone and enter frontend folder:

```bash
git clone <your-repository-url>
cd Rebuilld-Hub/rebuildhub-frontend
```

3. Install dependencies:

```bash
npm install
```

### 1.3 Environment Configuration

Current implementation uses hardcoded backend URLs (`http://localhost:5000`) in service and component calls.

No mandatory frontend `.env` keys are currently required to run local development.

### 1.4 Run the Frontend

Use Vite dev server:

```bash
npm run dev
```

Alternative script available:

```bash
npm start
```

### 1.5 Verify Startup

- App should open in browser.
- Home page should load.
- Admin login page should be reachable at `/admin/login`.

## 2. Frontend Route Documentation

The app uses React Router with a ProtectedRoute role guard.

| Path | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Home page |
| `/admin/login` | Public | Admin and staff login |
| `/dashboard` | Admin only | Admin dashboard |
| `/admin/dashboard` | Admin only | Admin dashboard alias |
| `/admin/aid-requests` | Admin only | Aid approval workflow |
| `/admin/aid-completed` | Admin only | Completed aid list |
| `/admin/resources` | Admin only | Resource management |
| `/admin/donations` | Admin only | Donation administration |
| `/inventory/dashboard` | Inventory manager only | Inventory manager dashboard |
| `/volunteer/dashboard` | Volunteer only | Volunteer dashboard |
| `/volunteer/apply` | Public | Volunteer registration |
| `/admin/volunteers` | Admin only | Volunteer management |
| `/disasters` | Public | Disaster list |
| `/disasters/new` | Public | Create disaster form |
| `/disasters/:id` | Public | Disaster details |
| `/reports/new` | Public | Damage report submission |
| `/damage/:id` | Public | Damage report details |
| `/aid/verified-reports` | Public | Verified reports list |
| `/aid/request` | Public | Aid request form |
| `/weather` | Public | Weather dashboard |
| `/resources` | Public | Resource listing and donation navigation |
| `/donate` | Public | Donation form |
| `/donate/:itemId` | Public | Donation form for selected item |
| `/donation-success` | Authenticated user | Post-payment success page |

## 3. API Endpoint Documentation (Used by Frontend)

Frontend calls backend at `http://localhost:5000`.

### 3.1 Authentication

| Method | Endpoint | Used For | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Login from admin login and auth context | Public |
| POST | `/api/auth/register` | Registration call in auth context | Public |

Response typically includes token and user object.

### 3.2 Disaster and Damage Modules

| Method | Endpoint | Used For | Auth |
| --- | --- | --- | --- |
| GET | `/api/disasters` | Disaster list | Public |
| GET | `/api/disasters/:id` | Disaster detail | Public |
| POST | `/api/disasters` | Create disaster with images | Public |
| PUT | `/api/disasters/:id` | Update disaster | Public |
| PATCH | `/api/disasters/verify/:id` | Verify disaster | Bearer + admin |
| DELETE | `/api/disasters/:id` | Delete disaster | Public |
| POST | `/api/disasters/:id/assign-volunteer` | Assign volunteer | Public |
| GET | `/api/reports/disaster/:disasterId` | List reports for a disaster | Public |
| GET | `/api/reports/:id` | Report detail | Public |
| POST | `/api/reports` | Submit report with images | Public |
| PATCH | `/api/reports/verify/:id` | Verify report | Bearer + admin |

### 3.3 Aid Module

| Method | Endpoint | Used For | Auth |
| --- | --- | --- | --- |
| POST | `/api/aids` | Submit aid request | Public |
| GET | `/api/aids` | View aid requests | Bearer |
| PUT | `/api/aids/:id/admin-decision` | Admin approval/rejection | Bearer + admin |
| PUT | `/api/aids/:id/distribution` | Update distribution status | Bearer + admin |

### 3.4 Volunteer and Events

| Method | Endpoint | Used For | Auth |
| --- | --- | --- | --- |
| POST | `/api/volunteers/register` | Volunteer apply form | Public |
| GET | `/api/volunteers` | Volunteer lists | Public |
| GET | `/api/volunteers/:id` | Volunteer profile fetch | Public |
| PUT | `/api/volunteers/:id` | Volunteer updates/verification | Public |
| DELETE | `/api/volunteers/:id` | Volunteer delete | Public |
| GET | `/api/events` | Stored event feeds | Public |
| GET | `/api/events/live` | Live event feed | Public |
| GET | `/api/events/categories` | Category options | Public |
| POST | `/api/events/:id/interest` | Express volunteer interest | Public |

### 3.5 Weather and Resources

| Method | Endpoint | Used For | Auth |
| --- | --- | --- | --- |
| GET | `/api/weather` | Current weather | Public |
| GET | `/api/weather/forecast` | Forecast | Public |
| GET | `/Rebuildhub/inventory` | Display resources/inventory | Public |
| POST | `/Rebuildhub/inventory` | Create inventory | Bearer + admin |
| PUT | `/Rebuildhub/inventory/:id` | Update inventory | Bearer + admin |
| DELETE | `/Rebuildhub/inventory/:id` | Delete inventory | Bearer + admin |
| POST | `/Rebuildhub/donations` | Record donation | Public |
| GET | `/Rebuildhub/donations` | Donation listing | Public |
| GET | `/Rebuildhub/donations/verify-payment` | Verify Stripe return session | Public |
| POST | `/Rebuildhub/donations/create-checkout-session` | Start Stripe checkout | Public |

## 4. Authentication and Session Handling

- JWT token is stored in localStorage.
- Axios API client attaches bearer token automatically when token exists.
- ProtectedRoute checks:
	- token existence
	- optional allowed roles
- Unauthorized users are redirected to home route.

## 5. Example API Calls from Frontend Flow

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"admin@example.com","password":"123456"}'

# Load resources page inventory
curl http://localhost:5000/Rebuildhub/inventory

# Volunteer registration
curl -X POST http://localhost:5000/api/volunteers/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Test","email":"t@example.com","phone":"0771234567","district":"Colombo","skills":["First Aid"]}'
```

## 6. Build and Test Commands

```bash
npm run dev
npm run build
npm test
```

## 7. Notes

- Frontend currently mixes Axios and Fetch calls.
- Base backend URL is currently hardcoded in multiple files.
- For production readiness, centralizing base URL in env variables is recommended.

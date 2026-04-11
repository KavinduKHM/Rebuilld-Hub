# rebuildhub-backend

Backend API for RebuildHub. This service powers authentication, disaster and damage workflows, aid distribution, volunteer operations, weather data, event feeds, inventory, donations, and Stripe payment flows.

## 1. Local Setup Guide (Step by Step)

### 1.1 Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- MongoDB connection string
- Stripe secret key
- Cloudinary credentials
- OpenWeather API key

### 1.2 Clone and Install

1. Open a terminal.
2. Clone and enter project:

```bash
git clone <your-repository-url>
cd Rebuilld-Hub/Rebuildhub-backend
```

3. Install dependencies:

```bash
npm install
```

### 1.3 Configure Environment Variables

Create `.env` in `Rebuildhub-backend/` and add:

```env
PORT=5000
MONGODB_URL=
JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

WEATHER_API_KEY=

STRIPE_SECRET_KEY=
FRONTEND_URL=http://localhost:3000

TWILIO_ENABLED=false
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_ASSIGNMENT_CONTENT_SID=
```

### 1.4 Run the API Locally

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

### 1.5 Verify Startup

- API base URL: `http://localhost:5000`
- Expected logs:
  - `MongoDB Connected Successfully`
  - `Server running on port 5000`

## 2. API Endpoint Documentation

Base URL: `http://localhost:5000`

Authentication for protected routes:

- Header: `Authorization: Bearer <JWT_TOKEN>`

Roles used by authorization middleware:

- `admin`
- `inventory_manager`
- `volunteer`
- `seeker`

### 2.1 Authentication (`/api/auth`)

| Method | Endpoint | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | `{ name, email, password, role? }` | `201 { message }` |
| POST | `/api/auth/login` | Public | `{ email, password }` | `200 { token, user: { id, name, email, role } }` |

Example:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'
```

### 2.2 Disasters (`/api/disasters`)

| Method | Endpoint | Auth | Request Format | Success Response |
| --- | --- | --- | --- | --- |
| POST | `/api/disasters` | Public | `multipart/form-data` with `images[]` (max 5) + disaster fields | `201 { success, message, disaster, autoDamageReport }` |
| GET | `/api/disasters` | Public | None | `200 Disaster[]` |
| GET | `/api/disasters/:id` | Public | None | `200 Disaster` |
| PATCH | `/api/disasters/verify/:id` | Bearer + admin | `{ status: "Verified"\|"Rejected"\|"Pending" }` | `200 { success, message, data }` |
| POST | `/api/disasters/:id/assign-volunteer` | Public (business checks volunteer state) | `{ volunteerId? , volunteerEmail? }` | `200 { success, message, data, notification }` |
| PUT | `/api/disasters/:id` | Public | JSON or multipart partial update | `200 Disaster` |
| DELETE | `/api/disasters/:id` | Public | None | `200 { message }` |

### 2.3 Damage Reports (`/api/reports`)

| Method | Endpoint | Auth | Request Format | Success Response |
| --- | --- | --- | --- | --- |
| POST | `/api/reports` | Public | `multipart/form-data` with `images[]` (max 5) + report fields | `201 { success, message, data }` |
| GET | `/api/reports/disaster/:disasterId` | Public | None | `200 { success, data: DamageReport[] }` |
| GET | `/api/reports/:id` | Public | None | `200 { success, data: DamageReport }` |
| PATCH | `/api/reports/verify/:id` | Bearer + admin | `{ status: "Approved"\|"Rejected"\|"Verified" }` | `200 { success, message, data }` |

### 2.4 Aids (`/api/aids`)

| Method | Endpoint | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- |
| POST | `/api/aids` | Public | `{ damageReportId, aidType, quantity, location }` | `201 Aid` |
| GET | `/api/aids` | Bearer | None | `200 Aid[]` |
| GET | `/api/aids/:id` | Bearer | None | `200 Aid` |
| PUT | `/api/aids/:id/admin-decision` | Bearer + admin | `{ decision: "APPROVED"\|"REJECTED" }` | `200 Aid` |
| PUT | `/api/aids/:id/distribution` | Bearer + admin | `{ status: "PENDING"\|"IN_PROGRESS"\|"COMPLETED" }` | `200 Aid` |
| DELETE | `/api/aids/:id` | Bearer + admin | None | `200 { message }` |
| GET | `/api/aids/__routes` | Public | None | `200 [{ path, methods }]` |

Sample aid request:

```json
{
  "damageReportId": "67f0abc123...",
  "aidType": "Food",
  "quantity": 50,
  "location": {
    "country": "Sri Lanka",
    "province": "Western",
    "district": "Colombo",
    "city": "Maharagama"
  }
}
```

### 2.5 Volunteers (`/api/volunteers`)

| Method | Endpoint | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- |
| GET | `/api/volunteers/test` | Public | None | `200 { success, message, time }` |
| GET | `/api/volunteers/debug` | Public | None | `200 { success, message, time }` |
| GET | `/api/volunteers` | Public | None | `200 { success, count, data }` |
| POST | `/api/volunteers/register` | Public | `{ name, email, phone, district, skills[], availability? }` | `201 { message, data }` |
| GET | `/api/volunteers/:id` | Public | None | `200 { success, data }` |
| PUT | `/api/volunteers/:id` | Public | partial volunteer fields | `200 { success, message, data }` |
| DELETE | `/api/volunteers/:id` | Public | None | `200 { success, message }` |

### 2.6 Events (`/api/events`)

| Method | Endpoint | Auth | Request Format | Success Response |
| --- | --- | --- | --- | --- |
| GET | `/api/events/fetch` | Public | query: `location=worldwide\|srilanka`, `category=all\|...` | `200 { success, message, data }` |
| GET | `/api/events` | Public | query: `location, category, days, limit` | `200 { success, count, location, category, data }` |
| GET | `/api/events/categories` | Public | None | `200 { success, data }` |
| GET | `/api/events/live` | Public | query: `location, category, days, limit` | `200 { success, source, location, category, count, data }` |
| GET | `/api/events/live/srilanka` | Public | query: `category, days, limit` | `200 { success, source, location, category, count, data }` |
| GET | `/api/events/live/map` | Public | query: `location, category, days, limit` | `200 { success, source, location, category, count, geojson }` |
| GET | `/api/events/live/map/view` | Public | query params optional | `200 HTML` |
| GET | `/api/events/:id` | Public | None | `200 { success, data }` |
| POST | `/api/events/:id/interest` | Public | `{ volunteerId?, eventData? }` | `200 { success, message }` |

### 2.7 Weather (`/api/weather`)

| Method | Endpoint | Auth | Request Format | Success Response |
| --- | --- | --- | --- | --- |
| GET | `/api/weather` | Public | query: `city=<cityName>` | `200 OpenWeather current weather payload` |
| GET | `/api/weather/forecast` | Public | query: `city=<cityName>` | `200 OpenWeather forecast payload` |

Example:

```bash
curl "http://localhost:5000/api/weather?city=Colombo"
```

### 2.8 Inventory (`/Rebuildhub/inventory`)

| Method | Endpoint | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- |
| POST | `/Rebuildhub/inventory` | Bearer + admin | `{ type, name, category?, unit?, totalQuantity?, totalAmount?, description? }` | `201 Inventory` |
| GET | `/Rebuildhub/inventory` | Public | None | `200 Inventory[]` |
| GET | `/Rebuildhub/inventory/:id` | Public | None | `200 Inventory` |
| PUT | `/Rebuildhub/inventory/:id` | Bearer + admin | partial inventory fields | `200 Inventory` |
| DELETE | `/Rebuildhub/inventory/:id` | Bearer + admin | None | `200 { message }` |

### 2.9 Donations (`/Rebuildhub/donations`)

| Method | Endpoint | Auth | Request Format | Success Response |
| --- | --- | --- | --- | --- |
| GET | `/Rebuildhub/donations/health` | Public | None | `200 { status, message }` |
| POST | `/Rebuildhub/donations/create-checkout-session` | Public | `{ amount, donorName, donorNIC, inventoryId, email?, name?, description?, isInternational?, originalCurrency?, originalAmount? }` | `200 { success, url, sessionId, donationId }` |
| GET | `/Rebuildhub/donations/verify-payment` | Public | query: `session_id`, `donation_id?` | `200 { success, message, donation? }` |
| GET | `/Rebuildhub/donations/stats` | Public | None | `200 donation stats` |
| GET | `/Rebuildhub/donations/donor/:donorNIC` | Public | None | `200 Donation[]` |
| GET | `/Rebuildhub/donations/session/:sessionId` | Public | None | `200 Donation` |
| POST | `/Rebuildhub/donations` | Public | donation payload | `201 Donation` |
| GET | `/Rebuildhub/donations` | Public | None | `200 Donation[]` |
| GET | `/Rebuildhub/donations/:id` | Public | None | `200 Donation` |
| PATCH | `/Rebuildhub/donations/:id` | Public | partial donation fields | `200 Donation` |
| DELETE | `/Rebuildhub/donations/:id` | Public | None | `200 { message }` |

### 2.10 Payment (`/Rebuildhub/payment`)

| Method | Endpoint | Auth | Request Body | Success Response |
| --- | --- | --- | --- | --- |
| POST | `/Rebuildhub/payment` | Public | `{ amount, currency? }` | `200 { clientSecret, status }` |

## 3. Authentication Requirements Summary

Protected endpoints and roles:

- Bearer token required:
  - `GET /api/aids`
  - `GET /api/aids/:id`
- Bearer + admin:
  - `PUT /api/aids/:id/admin-decision`
  - `PUT /api/aids/:id/distribution`
  - `DELETE /api/aids/:id`
  - `PATCH /api/disasters/verify/:id`
  - `PATCH /api/reports/verify/:id`
  - `POST /Rebuildhub/inventory`
  - `PUT /Rebuildhub/inventory/:id`
  - `DELETE /Rebuildhub/inventory/:id`

Common auth errors:

- `401 { message: "No token provided" }`
- `401 { message: "Invalid token" }`
- `403 { message: "Admin access only" }`
- `403 { message: "Access denied" }`

## 4. Request/Response Format Notes

- Most endpoints use JSON request/response.
- Upload endpoints use multipart form data with images field.
- API response shapes differ slightly by module (some wrap in success/data, others return model objects directly).

## 5. Quick Test Requests

```bash
# Get disasters
curl http://localhost:5000/api/disasters

# Get all inventory
curl http://localhost:5000/Rebuildhub/inventory

# Verify a payment
curl "http://localhost:5000/Rebuildhub/donations/verify-payment?session_id=<SESSION_ID>"
```

# RebuildHub API Documentation (Volunteer + Events)

Base URL: `http://localhost:5000`

## Authentication

Current status for these modules:
- Volunteer routes (`/api/volunteers`): No auth middleware applied.
- Event routes (`/api/events`): No auth middleware applied.
- Some handlers can read `req.user` if a future auth middleware is added, but requests work without auth headers right now.

---

## Volunteer API

Route base: `/api/volunteers`

### 1. Health/Test Route

- Method: `GET`
- Endpoint: `/api/volunteers/test`
- Auth: Not required
- Request body: None

Example request:
```bash
curl -X GET http://localhost:5000/api/volunteers/test
```

Example response `200`:
```json
{
  "success": true,
  "message": "Test route working",
  "time": "2026-04-10T08:00:00.000Z"
}
```

### 2. Debug Route

- Method: `GET`
- Endpoint: `/api/volunteers/debug`
- Auth: Not required
- Request body: None

Example request:
```bash
curl -X GET http://localhost:5000/api/volunteers/debug
```

Example response `200`:
```json
{
  "success": true,
  "message": "Debug route working",
  "time": "2026-04-10T08:00:00.000Z"
}
```

### 3. Register Volunteer

- Method: `POST`
- Endpoint: `/api/volunteers/register`
- Auth: Not required
- Validation middleware: Yes (`express-validator`)

Request body:
```json
{
  "name": "Alex Silva",
  "email": "alex@example.com",
  "password": "secret123",
  "phone": "0771234567",
  "district": "Colombo",
  "skills": ["First Aid", "Logistics"]
}
```

Notes:
- `phone` is normalized server-side (e.g. `07xxxxxxxx` -> `+947xxxxxxxx`).
- Also creates a linked user account with role `volunteer`.

Example request:
```bash
curl -X POST http://localhost:5000/api/volunteers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Alex Silva",
    "email":"alex@example.com",
    "password":"secret123",
    "phone":"0771234567",
    "district":"Colombo",
    "skills":["First Aid","Logistics"]
  }'
```

Example success response `201`:
```json
{
  "message": "Volunteer registered successfully. Pending verification.",
  "data": {
    "_id": "67f7a8f0e1c6cd0012ab3456",
    "volunteerId": 101,
    "name": "Alex Silva",
    "email": "alex@example.com",
    "phone": "+94771234567",
    "district": "Colombo",
    "skills": ["First Aid", "Logistics"],
    "availability": "UNAVAILABLE",
    "verificationStatus": "PENDING",
    "createdAt": "2026-04-10T08:00:00.000Z",
    "updatedAt": "2026-04-10T08:00:00.000Z"
  }
}
```

Example validation error `400`:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Password must be at least 6 characters",
      "path": "password",
      "location": "body"
    }
  ]
}
```

### 4. Get All Volunteers

- Method: `GET`
- Endpoint: `/api/volunteers`
- Auth: Not required
- Request body: None

Example request:
```bash
curl -X GET http://localhost:5000/api/volunteers
```

Example response `200`:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "67f7a8f0e1c6cd0012ab3456",
      "volunteerId": 101,
      "name": "Alex Silva",
      "email": "alex@example.com",
      "phone": "+94771234567",
      "district": "Colombo",
      "skills": ["First Aid", "Logistics"],
      "availability": "UNAVAILABLE",
      "verificationStatus": "PENDING"
    }
  ]
}
```

### 5. Get Volunteer by ID

- Method: `GET`
- Endpoint: `/api/volunteers/:id`
- Auth: Not required
- Path param `id` supports:
  - Mongo ObjectId (`67f7a8f0e1c6cd0012ab3456`)
  - Numeric volunteerId (`101`)

Example request:
```bash
curl -X GET http://localhost:5000/api/volunteers/67f7a8f0e1c6cd0012ab3456
```

Example success response `200`:
```json
{
  "success": true,
  "data": {
    "_id": "67f7a8f0e1c6cd0012ab3456",
    "volunteerId": 101,
    "name": "Alex Silva",
    "email": "alex@example.com",
    "phone": "+94771234567",
    "district": "Colombo",
    "skills": ["First Aid", "Logistics"],
    "availability": "AVAILABLE",
    "verificationStatus": "VERIFIED"
  }
}
```

Example not found `404`:
```json
{
  "success": false,
  "message": "Volunteer not found"
}
```

Example invalid id `400`:
```json
{
  "success": false,
  "message": "Invalid volunteer identifier"
}
```

### 6. Update Volunteer

- Method: `PUT`
- Endpoint: `/api/volunteers/:id`
- Auth: Not required

Request body (partial updates supported):
```json
{
  "phone": "0712345678",
  "availability": "AVAILABLE",
  "skills": ["First Aid", "Rescue", "Logistics"]
}
```

Example request:
```bash
curl -X PUT http://localhost:5000/api/volunteers/67f7a8f0e1c6cd0012ab3456 \
  -H "Content-Type: application/json" \
  -d '{"phone":"0712345678","availability":"AVAILABLE"}'
```

Example success response `200`:
```json
{
  "success": true,
  "message": "Volunteer updated successfully",
  "data": {
    "_id": "67f7a8f0e1c6cd0012ab3456",
    "phone": "+94712345678",
    "availability": "AVAILABLE"
  }
}
```

### 7. Delete Volunteer

- Method: `DELETE`
- Endpoint: `/api/volunteers/:id`
- Auth: Not required

Example request:
```bash
curl -X DELETE http://localhost:5000/api/volunteers/67f7a8f0e1c6cd0012ab3456
```

Example success response `200`:
```json
{
  "success": true,
  "message": "Volunteer deleted successfully"
}
```

---

## Events API

Route base: `/api/events`

### 1. Fetch & Store from NASA

- Method: `GET`
- Endpoint: `/api/events/fetch`
- Auth: Not required
- Query params:
  - `location`: `worldwide` | `srilanka` (default: `worldwide`)
  - `category`: NASA category key or `all` (default: `all`)

Example request:
```bash
curl -X GET "http://localhost:5000/api/events/fetch?location=srilanka&category=floods"
```

Example response `200`:
```json
{
  "success": true,
  "message": "Fetched 12 events across 1 categories. New: 3, Updated: 9",
  "data": {
    "total": 12,
    "new": 3,
    "updated": 9,
    "location": "srilanka",
    "categories": ["floods"]
  }
}
```

### 2. Get Stored Events (Filtered)

- Method: `GET`
- Endpoint: `/api/events`
- Auth: Not required
- Query params:
  - `location` (default `worldwide`)
  - `category` (optional)
  - `days` (default `30`)
  - `limit` (default `50`)

Example request:
```bash
curl -X GET "http://localhost:5000/api/events?location=worldwide&category=floods&days=30&limit=20"
```

Example response `200`:
```json
{
  "success": true,
  "count": 2,
  "location": "worldwide",
  "category": "floods",
  "data": [
    {
      "_id": "67f7b123e1c6cd0012ab9999",
      "nasaEventId": "EONET_1234",
      "title": "Flood in Region",
      "category": "Floods",
      "status": "ACTIVE",
      "dateStarted": "2026-04-09T10:00:00.000Z"
    }
  ]
}
```

### 3. Get Event Categories

- Method: `GET`
- Endpoint: `/api/events/categories`
- Auth: Not required

Example response `200`:
```json
{
  "success": true,
  "data": [
    { "id": "wildfires", "name": "Wildfires" },
    { "id": "severeStorms", "name": "Severe Storms" },
    { "id": "volcanoes", "name": "Volcanoes" }
  ]
}
```

### 4. Get Live Events (NASA, No DB Write)

- Method: `GET`
- Endpoint: `/api/events/live`
- Auth: Not required
- Query params:
  - `location` (default `worldwide`)
  - `category` (default `all`)
  - `days` (default `30`)
  - `limit` (default `100`)

Example request:
```bash
curl -X GET "http://localhost:5000/api/events/live?location=srilanka&category=all&days=14&limit=50"
```

Example response `200`:
```json
{
  "success": true,
  "source": "NASA EONET (LIVE)",
  "location": "srilanka",
  "category": "all",
  "categories": ["wildfires", "severeStorms"],
  "count": 5,
  "data": [
    {
      "id": "EONET_777",
      "title": "Severe Storm in Region",
      "category": "Severe Storms",
      "status": "open",
      "location": {
        "type": "Point",
        "coordinates": [80.5, 7.2]
      }
    }
  ]
}
```

### 5. Get Live Sri Lanka Events Shortcut

- Method: `GET`
- Endpoint: `/api/events/live/srilanka`
- Auth: Not required
- Query params:
  - `category` (default `all`)
  - `days` (default `30`)
  - `limit` (default `100`)

Example request:
```bash
curl -X GET "http://localhost:5000/api/events/live/srilanka?category=floods"
```

### 6. Get Live Events as GeoJSON

- Method: `GET`
- Endpoint: `/api/events/live/map`
- Auth: Not required
- Query params:
  - `location`, `category`, `days`, `limit`

Example request:
```bash
curl -X GET "http://localhost:5000/api/events/live/map?location=worldwide&category=all&days=30&limit=200"
```

Example response `200`:
```json
{
  "success": true,
  "source": "NASA EONET (LIVE)",
  "location": "worldwide",
  "category": "all",
  "count": 10,
  "geojson": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [80.5, 7.2]
        },
        "properties": {
          "id": "EONET_777",
          "title": "Severe Storm in Region",
          "category": "Severe Storms"
        }
      }
    ]
  }
}
```

### 7. Live Map HTML Viewer

- Method: `GET`
- Endpoint: `/api/events/live/map/view`
- Auth: Not required
- Query params: same as `/live/map`
- Response type: `text/html`

Example request:
```bash
curl -X GET "http://localhost:5000/api/events/live/map/view?location=worldwide&category=all"
```

### 8. Get Single Event by Mongo ID

- Method: `GET`
- Endpoint: `/api/events/:id`
- Auth: Not required

Example request:
```bash
curl -X GET http://localhost:5000/api/events/67f7b123e1c6cd0012ab9999
```

Example `404`:
```json
{
  "success": false,
  "message": "Event not found"
}
```

### 9. Express Interest in Event

- Method: `POST`
- Endpoint: `/api/events/:id/interest`
- Auth: Not required currently (volunteer identity must still be provided and validated)

Request body:
```json
{
  "volunteerId": "67f7a8f0e1c6cd0012ab3456",
  "eventData": {
    "id": "EONET_777",
    "title": "Flood Event",
    "category": "Floods",
    "location": { "type": "Point", "coordinates": [80.5, 7.2] },
    "countries": ["Sri Lanka"],
    "districts": ["Colombo"],
    "status": "ACTIVE",
    "dateStarted": "2026-04-09T10:00:00.000Z",
    "requiredSkills": ["First Aid", "Rescue"]
  }
}
```

Behavior:
- Volunteer must exist and be `VERIFIED` + `AVAILABLE`.
- If `:id` is not found as Mongo event id, backend tries `nasaEventId`.
- If still not found and `eventData.id` exists, backend creates an event record then records interest.

Example success response `200`:
```json
{
  "success": true,
  "message": "Interest recorded"
}
```

Example business-rule error `403`:
```json
{
  "success": false,
  "message": "Only verified and available volunteers can express interest"
}
```

---

## Common Error Response Patterns

Validation error pattern:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

Generic server error pattern:
```json
{
  "success": false,
  "message": "<error message>"
}
```

---

## Notes for Production Hardening

- Add auth middleware to volunteer update/delete and event interest endpoints.
- Add rate limiting to NASA fetch/live endpoints.
- Remove debug/test routes or protect them.
- Move response shapes to a consistent API format across modules.

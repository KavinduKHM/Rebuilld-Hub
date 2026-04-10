# RebuildHub API Endpoint Documentation

This document covers the Inventory, Resource Donation, and Payment APIs implemented in the backend.

## Base URL

- Local example: `http://localhost:5000`

## Authentication

Some endpoints require JWT authentication.

- Header format: `Authorization: Bearer <jwt_token>`
- Admin-only endpoints require `req.user.role === "admin"`

---

## 1) Inventory API

Base path: `/Rebuildhub/inventory`

### Inventory Object (Response Shape)

```json
{
  "_id": "67f42e90d6e64e7bfa4b41a1",
  "inventoryCode": "INV-MNY-NONE-FLOO-001",
  "type": "MONEY",
  "name": "Flood Relief Fund",
  "description": "Cash fund for flood victims",
  "totalAmount": 125000,
  "status": "Available",
  "createdAt": "2026-04-10T10:00:00.000Z",
  "updatedAt": "2026-04-10T10:05:00.000Z",
  "__v": 0
}
```

Notes:
- If `type = "MONEY"`, the response excludes `totalQuantity`, `unit`, and `category`.
- If `type = "STOCK"`, the response excludes `totalAmount`.

### 1.1 Create Inventory

- Method: `POST`
- Endpoint: `/Rebuildhub/inventory`
- Auth: `Bearer token + Admin only`

Request body (MONEY example):

```json
{
  "type": "MONEY",
  "name": "Flood Relief Fund",
  "description": "Cash-only donation fund",
  "totalAmount": 0
}
```

Request body (STOCK example):

```json
{
  "type": "STOCK",
  "category": "Food",
  "unit": "pack",
  "name": "Dry Ration Packs",
  "description": "Emergency dry food",
  "totalQuantity": 100
}
```

Success response:
- Status: `201 Created`

```json
{
  "_id": "67f42e90d6e64e7bfa4b41a1",
  "inventoryCode": "INV-STK-FOOD-DRYR-001",
  "type": "STOCK",
  "category": "Food",
  "unit": "pack",
  "name": "Dry Ration Packs",
  "description": "Emergency dry food",
  "totalQuantity": 100,
  "status": "Available",
  "createdAt": "2026-04-10T10:00:00.000Z",
  "updatedAt": "2026-04-10T10:00:00.000Z",
  "__v": 0
}
```

Error responses:
- `400 Bad Request`

```json
{ "message": "<validation or save error>" }
```

### 1.2 Get All Inventory

- Method: `GET`
- Endpoint: `/Rebuildhub/inventory`
- Auth: `None`

Success response:
- Status: `200 OK`

```json
[
  {
    "_id": "67f42e90d6e64e7bfa4b41a1",
    "inventoryCode": "INV-MNY-NONE-FLOO-001",
    "type": "MONEY",
    "name": "Flood Relief Fund",
    "description": "Cash fund for flood victims",
    "totalAmount": 125000,
    "status": "Available",
    "createdAt": "2026-04-10T10:00:00.000Z",
    "updatedAt": "2026-04-10T10:05:00.000Z",
    "__v": 0
  }
]
```

Error responses:
- `500 Internal Server Error`

```json
{ "message": "<server error>" }
```

### 1.3 Get Inventory by ID

- Method: `GET`
- Endpoint: `/Rebuildhub/inventory/:id`
- Auth: `None`

Path params:
- `id` (string, MongoDB ObjectId)

Success response:
- Status: `200 OK`
- Body: Inventory object

Error responses:
- `404 Not Found`

```json
{ "message": "Inventory not found" }
```

### 1.4 Update Inventory

- Method: `PUT`
- Endpoint: `/Rebuildhub/inventory/:id`
- Auth: `Bearer token + Admin only`

Path params:
- `id` (string, MongoDB ObjectId)

Request body:
- Any updatable inventory fields.
- `inventoryCode` is ignored even if sent.

Example:

```json
{
  "description": "Updated description",
  "totalQuantity": 80
}
```

Success response:
- Status: `200 OK`
- Body: Updated inventory object

Error responses:
- `400 Bad Request`

```json
{ "message": "<validation error>" }
```

### 1.5 Delete Inventory

- Method: `DELETE`
- Endpoint: `/Rebuildhub/inventory/:id`
- Auth: `Bearer token + Admin only`

Path params:
- `id` (string, MongoDB ObjectId)

Success response:
- Status: `200 OK`

```json
{ "message": "Inventory deleted successfully" }
```

Error responses:
- `404 Not Found`

```json
{ "message": "Inventory not found" }
```

---

## 2) Donation API (Resources)

Base path: `/Rebuildhub/donations`

### Donation Object (Response Shape)

```json
{
  "_id": "67f432e3d6e64e7bfa4b4210",
  "donorName": "Jane Doe",
  "donorNIC": "931234567V",
  "email": "jane@example.com",
  "inventoryId": "67f42e90d6e64e7bfa4b41a1",
  "type": "MONEY",
  "name": "Flood Relief Fund",
  "description": "Keep communities supplied",
  "amount": 5000,
  "paymentStatus": "PENDING",
  "createdAt": "2026-04-10T11:00:00.000Z",
  "updatedAt": "2026-04-10T11:00:00.000Z",
  "__v": 0
}
```

`type` enum: `MONEY | STOCK`

`paymentStatus` enum: `PENDING | SUCCESS`

### 2.1 Health Check

- Method: `GET`
- Endpoint: `/Rebuildhub/donations/health`
- Auth: `None`

Success response:
- Status: `200 OK`

```json
{ "status": "OK", "message": "Donation route is working!" }
```

### 2.2 Create Checkout Session (Stripe)

- Method: `POST`
- Endpoint: `/Rebuildhub/donations/create-checkout-session`
- Auth: `None`

Request body:

```json
{
  "amount": 5000,
  "donorName": "Jane Doe",
  "donorNIC": "931234567V",
  "email": "jane@example.com",
  "inventoryId": "67f42e90d6e64e7bfa4b41a1",
  "name": "Flood Relief Fund",
  "description": "Help flood-affected families",
  "isInternational": false,
  "originalCurrency": "LKR",
  "originalAmount": 5000
}
```

Required fields:
- `amount`
- `donorName`
- `donorNIC`
- `inventoryId`

Success response:
- Status: `200 OK`

```json
{
  "success": true,
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_a1b2c3",
  "donationId": "67f432e3d6e64e7bfa4b4210"
}
```

Error responses:
- `400 Bad Request`

```json
{ "message": "Amount is required" }
```

```json
{ "message": "Donor name is required" }
```

```json
{ "message": "NIC/ID is required" }
```

```json
{ "message": "Fund selection is required" }
```

- `500 Internal Server Error`

```json
{ "message": "<stripe/server error>" }
```

### 2.3 Verify Payment

- Method: `GET`
- Endpoint: `/Rebuildhub/donations/verify-payment`
- Auth: `None`

Query params:
- `session_id` (required)
- `donation_id` (optional)

Success response (paid):
- Status: `200 OK`

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "donation": {
    "id": "67f432e3d6e64e7bfa4b4210",
    "amount": 5000,
    "donorName": "Jane Doe",
    "name": "Flood Relief Fund",
    "originalCurrency": "LKR",
    "originalAmount": 5000
  }
}
```

Success response (not paid yet):
- Status: `200 OK`

```json
{
  "success": false,
  "message": "Payment not completed. Status: unpaid"
}
```

Error responses:
- `400 Bad Request`

```json
{ "success": false, "message": "Session ID is required" }
```

- `404 Not Found`

```json
{ "success": false, "message": "Donation record not found" }
```

- `500 Internal Server Error`

```json
{ "success": false, "message": "<verification error>" }
```

### 2.4 Get Donation Stats

- Method: `GET`
- Endpoint: `/Rebuildhub/donations/stats`
- Auth: `None`

Success response:
- Status: `200 OK`

```json
{
  "totalDonations": 50,
  "successfulDonations": 40,
  "pendingDonations": 10,
  "totalMoneyAmount": 250000,
  "totalStockQuantity": 420
}
```

Error responses:
- `500 Internal Server Error`

```json
{ "message": "<server error>" }
```

### 2.5 Get Donations by Donor NIC

- Method: `GET`
- Endpoint: `/Rebuildhub/donations/donor/:donorNIC`
- Auth: `None`

Path params:
- `donorNIC` (string)

Success response:
- Status: `200 OK`
- Body: array of donation objects

Error responses:
- `500 Internal Server Error`

```json
{ "message": "<server error>" }
```

### 2.6 Get Donation by Stripe Session ID

- Method: `GET`
- Endpoint: `/Rebuildhub/donations/session/:sessionId`
- Auth: `None`

Path params:
- `sessionId` (string)

Success response:
- Status: `200 OK`
- Body: donation object

Error responses:
- `404 Not Found`

```json
{ "message": "Donation not found" }
```

### 2.7 Create Donation (Direct CRUD)

- Method: `POST`
- Endpoint: `/Rebuildhub/donations`
- Auth: `None`

Request body (MONEY):

```json
{
  "donorName": "Jane Doe",
  "donorNIC": "931234567V",
  "email": "jane@example.com",
  "inventoryId": "67f42e90d6e64e7bfa4b41a1",
  "type": "MONEY",
  "name": "Flood Relief Fund",
  "description": "Cash contribution",
  "amount": 5000,
  "paymentStatus": "PENDING"
}
```

Request body (STOCK):

```json
{
  "donorName": "John Smith",
  "donorNIC": "902223333V",
  "inventoryId": "67f42f01d6e64e7bfa4b41bd",
  "type": "STOCK",
  "name": "Blanket Donation",
  "description": "Warm blankets",
  "quantity": 20,
  "unit": "pcs",
  "paymentStatus": "SUCCESS"
}
```

Success response:
- Status: `201 Created`

```json
{
  "donation": {
    "_id": "67f432e3d6e64e7bfa4b4210",
    "donorName": "Jane Doe",
    "donorNIC": "931234567V",
    "inventoryId": "67f42e90d6e64e7bfa4b41a1",
    "type": "MONEY",
    "name": "Flood Relief Fund",
    "amount": 5000,
    "paymentStatus": "PENDING"
  }
}
```

Error responses:
- `400 Bad Request`

```json
{ "message": "<validation error>" }
```

### 2.8 Get All Donations

- Method: `GET`
- Endpoint: `/Rebuildhub/donations`
- Auth: `None`

Success response:
- Status: `200 OK`
- Body: array of donation objects (sorted by newest first)

Error responses:
- `500 Internal Server Error`

```json
{ "message": "<server error>" }
```

### 2.9 Get Donation by ID

- Method: `GET`
- Endpoint: `/Rebuildhub/donations/:id`
- Auth: `None`

Path params:
- `id` (string, MongoDB ObjectId)

Success response:
- Status: `200 OK`
- Body: donation object

Error responses:
- `404 Not Found`

```json
{ "message": "Donation not found" }
```

### 2.10 Update Donation Status / Fields

- Method: `PATCH`
- Endpoint: `/Rebuildhub/donations/:id`
- Auth: `None`

Path params:
- `id` (string, MongoDB ObjectId)

Request body example:

```json
{
  "paymentStatus": "SUCCESS"
}
```

Success response:
- Status: `200 OK`
- Body: updated donation object

Error responses:
- `404 Not Found`

```json
{ "message": "Donation not found" }
```

### 2.11 Delete Donation

- Method: `DELETE`
- Endpoint: `/Rebuildhub/donations/:id`
- Auth: `None`

Path params:
- `id` (string, MongoDB ObjectId)

Success response:
- Status: `200 OK`

```json
{ "message": "Donation deleted successfully" }
```

Error responses:
- `404 Not Found`

```json
{ "message": "Donation not found" }
```

---

## 3) Payment API

Base path: `/Rebuildhub/payment`

### 3.1 Create Payment Intent (Stripe)

- Method: `POST`
- Endpoint: `/Rebuildhub/payment`
- Auth: `None`

Request body:

```json
{
  "amount": 5000,
  "currency": "LKR"
}
```

Notes:
- `amount` is required and interpreted in major currency units before converting to cents.
- `currency` defaults to `LKR` when omitted.

Success response:
- Status: `200 OK`

```json
{
  "clientSecret": "pi_3...._secret_...",
  "status": "success"
}
```

Error responses:
- `400 Bad Request`

```json
{ "message": "Amount is required" }
```

- `500 Internal Server Error`

```json
{ "message": "<stripe/server error>" }
```

---

## Common Auth Failure Responses

For endpoints protected by `authMiddleware`:

- `401 Unauthorized`

```json
{ "message": "No token provided" }
```

```json
{ "message": "Invalid token" }
```

For endpoints protected by `adminOnly`:

- `403 Forbidden`

```json
{ "message": "Admin access only" }
```

---

## Example cURL Requests

### Create Inventory (admin)

```bash
curl -X POST http://localhost:5000/Rebuildhub/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_jwt>" \
  -d '{
    "type": "STOCK",
    "category": "Food",
    "unit": "pack",
    "name": "Dry Ration Packs",
    "description": "Emergency dry food",
    "totalQuantity": 100
  }'
```

### Create Stripe Checkout Session (donation)

```bash
curl -X POST http://localhost:5000/Rebuildhub/donations/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "donorName": "Jane Doe",
    "donorNIC": "931234567V",
    "email": "jane@example.com",
    "inventoryId": "67f42e90d6e64e7bfa4b41a1",
    "name": "Flood Relief Fund",
    "description": "Help flood-affected families"
  }'
```

### Create Payment Intent

```bash
curl -X POST http://localhost:5000/Rebuildhub/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "LKR"
  }'
```

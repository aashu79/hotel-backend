# Stripe Payment & Tax/Service Rate API Documentation

This document describes the backend API endpoints for Stripe payment integration and tax/service rate management. It is intended for frontend developers to implement payment and tax/service features.

---

## 1. Stripe Payment Integration

### 1.1. Create Checkout Session

- **Endpoint:** `POST /api/payments/create-checkout-session`
- **Auth:** User must be authenticated
- **Body:**
  ```json
  {
    "orderId": "string", // Order ID
    "amount": 100.0, // Total amount (float, in main currency unit)
    "currency": "INR", // Currency code (e.g., "INR", "USD")
    "userId": "string" // User ID
  }
  ```
- **Response:**
  ```json
  { "url": "https://checkout.stripe.com/pay/cs_test_..." }
  ```
- **Usage:** Redirect user to the returned `url` for payment.

### 1.2. Stripe Webhook (Backend Only)

- **Endpoint:** `POST /api/stripe/webhook`
- **Auth:** None (Stripe only)
- **Content-Type:** `application/json` (raw body)
- **Purpose:** Stripe calls this endpoint after payment events. On successful payment, it records the payment and sale in the database.
- **No frontend action required.**

---

## 2. Tax & Service Rate Management

### 2.1. Get All Rates

- **Endpoint:** `GET /api/tax-service-rates/`
- **Auth:** User must be authenticated
- **Response:**
  ```json
  [
    { "id": "...", "name": "GST", "rate": 0.18, "isActive": true, ... },
    ...
  ]
  ```

### 2.2. Get Rate by ID

- **Endpoint:** `GET /api/tax-service-rates/:id`
- **Auth:** User must be authenticated
- **Response:**
  ```json
  { "id": "...", "name": "GST", "rate": 0.18, "isActive": true, ... }
  ```

### 2.3. Create Rate (Admin Only)

- **Endpoint:** `POST /api/tax-service-rates/`
- **Auth:** Admin only
- **Body:**
  ```json
  { "name": "GST", "rate": 0.18, "isActive": true }
  ```
- **Response:** Created rate object

### 2.4. Update Rate (Admin Only)

- **Endpoint:** `PUT /api/tax-service-rates/:id`
- **Auth:** Admin only
- **Body:**
  ```json
  { "name": "GST", "rate": 0.18, "isActive": true }
  ```
- **Response:** Updated rate object

### 2.5. Delete Rate (Admin Only)

- **Endpoint:** `DELETE /api/tax-service-rates/:id`
- **Auth:** Admin only
- **Response:** 204 No Content

---

## 3. Notes for Frontend Developers

- Use `/api/payments/create-checkout-session` to initiate Stripe payment and redirect user to Stripe Checkout.
- Listen for payment success/cancel on the frontend using the URLs you provide to Stripe (see backend config).
- Use `/api/tax-service-rates/` endpoints to fetch and display tax/service rates.
- Only admins can create, update, or delete tax/service rates.
- All endpoints require JWT authentication except the Stripe webhook.

---

## 4. Environment Variables Used

- `STRIPE_SECRET_KEY` — Stripe secret key for backend
- `STRIPE_PUBLISHABLE_KEY` — Stripe publishable key for frontend
- `STRIPE_WEBHOOK_SECRET` — Webhook secret for backend
- `FRONTEND_URL` — Used for Stripe success/cancel URLs

---

For any questions, contact the backend team.

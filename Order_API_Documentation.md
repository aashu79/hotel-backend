# Order API Documentation

Base URL: `/api/orders`

## Authentication

All endpoints require a valid JWT token in the `Authorization` header:  
`Authorization: Bearer <token>`

---

## 1. Create Order

**Endpoint:** `POST /api/orders`  
**Description:** Create a new order.

### Request Body

```json
{
  "userId": "string (UUID, required)",
  "items": [
    {
      "menuItemId": "string (UUID, required)",
      "quantity": "number (required, min: 1)"
    }
  ],
  "tableNumber": "number (optional)",
  "status": "string (optional, default: 'PENDING')"
}
```

### Validation

- `userId`: Required, must be a valid UUID.
- `items`: Required, array of objects.
  - `menuItemId`: Required, must be a valid UUID.
  - `quantity`: Required, integer ≥ 1.
- `tableNumber`: Optional, integer ≥ 1.
- `status`: Optional, one of `'PENDING'`, `'IN_PROGRESS'`, `'COMPLETED'`, `'CANCELLED'`.

### Response

- `201 Created`

```json
{
  "id": "string (UUID)",
  "userId": "string (UUID)",
  "items": [
    {
      "menuItemId": "string (UUID)",
      "quantity": "number"
    }
  ],
  "tableNumber": "number",
  "status": "string",
  "createdAt": "ISO8601 string",
  "updatedAt": "ISO8601 string"
}
```

### Errors

- `400 Bad Request`: Validation failed (details in message).
- `401 Unauthorized`: Missing or invalid token.

---

## 2. Get All Orders

**Endpoint:** `GET /api/orders`  
**Description:** Fetch all orders (admin/staff only).

### Query Parameters (optional)

- `status`: Filter by order status.
- `userId`: Filter by user UUID.

### Response

- `200 OK`

```json
[
  {
    "id": "string (UUID)",
    "userId": "string (UUID)",
    "items": [
      {
        "menuItemId": "string (UUID)",
        "quantity": "number"
      }
    ],
    "tableNumber": "number",
    "status": "string",
    "createdAt": "ISO8601 string",
    "updatedAt": "ISO8601 string"
  }
]
```

### Errors

- `401 Unauthorized`: Missing or invalid token.
- `403 Forbidden`: Insufficient permissions.

---

## 3. Get Single Order

**Endpoint:** `GET /api/orders/:id`  
**Description:** Fetch a single order by ID.

### URL Params

- `id`: Required, UUID of the order.

### Response

- `200 OK`

```json
{
  "id": "string (UUID)",
  "userId": "string (UUID)",
  "items": [
    {
      "menuItemId": "string (UUID)",
      "quantity": "number"
    }
  ],
  "tableNumber": "number",
  "status": "string",
  "createdAt": "ISO8601 string",
  "updatedAt": "ISO8601 string"
}
```

### Errors

- `400 Bad Request`: Invalid UUID.
- `404 Not Found`: Order not found.
- `401 Unauthorized`: Missing or invalid token.

---

## 4. Update Order

**Endpoint:** `PUT /api/orders/:id`  
**Description:** Update an existing order.

### URL Params

- `id`: Required, UUID of the order.

### Request Body

```json
{
  "items": [
    {
      "menuItemId": "string (UUID, required)",
      "quantity": "number (required, min: 1)"
    }
  ],
  "tableNumber": "number (optional)",
  "status": "string (optional)"
}
```

### Validation

- `items`: Optional, array of objects.
  - `menuItemId`: Required if items provided, must be a valid UUID.
  - `quantity`: Required if items provided, integer ≥ 1.
- `tableNumber`: Optional, integer ≥ 1.
- `status`: Optional, one of `'PENDING'`, `'IN_PROGRESS'`, `'COMPLETED'`, `'CANCELLED'`.

### Response

- `200 OK`

```json
{
  "id": "string (UUID)",
  "userId": "string (UUID)",
  "items": [
    {
      "menuItemId": "string (UUID)",
      "quantity": "number"
    }
  ],
  "tableNumber": "number",
  "status": "string",
  "createdAt": "ISO8601 string",
  "updatedAt": "ISO8601 string"
}
```

### Errors

- `400 Bad Request`: Validation failed.
- `404 Not Found`: Order not found.
- `401 Unauthorized`: Missing or invalid token.

---

## 5. Delete Order

**Endpoint:** `DELETE /api/orders/:id`  
**Description:** Delete an order by ID.

### URL Params

- `id`: Required, UUID of the order.

### Response

- `204 No Content`

### Errors

- `400 Bad Request`: Invalid UUID.
- `404 Not Found`: Order not found.
- `401 Unauthorized`: Missing or invalid token.

---

## Common Error Response Format

```json
{
  "error": "Error message describing the issue"
}
```

---

## Notes for Frontend Integration

- All IDs are UUID strings.
- All requests and responses use JSON.
- All endpoints require JWT authentication.
- Validation errors return a 400 status with a descriptive message.
- Only admin/staff can fetch all orders; users can fetch their own orders.
- Status values: `'PENDING'`, `'IN_PROGRESS'`, `'COMPLETED'`, `'CANCELLED'`.

---

If you need example requests, more details on roles/permissions, or documentation for other endpoints, let me know!

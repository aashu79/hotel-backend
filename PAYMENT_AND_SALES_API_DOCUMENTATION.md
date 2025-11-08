# Payment and Sales API Documentation

## Overview

This API provides comprehensive endpoints for admin users to manage and analyze payments, sales, and various business metrics for the restaurant management system.

## Base URL

```
/api/admin
```

## Authentication

All endpoints require:

- **Authentication**: Bearer token in Authorization header
- **Authorization**: Admin role only

## Database Migration Required

Before using these APIs, you need to apply the database migration:

```bash
# Step 1: Create migration file without applying (review the SQL)
npx prisma migrate dev --create-only --name add_payment_and_sale_relations

# Step 2: Review the generated migration file in prisma/migrations/

# Step 3: Deploy the migration to the database
npx prisma migrate deploy

# OR if you want to apply directly in development
npx prisma migrate dev
```

---

## API Endpoints

### 🔷 Payment APIs

#### 1. Get All Payments

```http
GET /api/admin/payments
```

**Query Parameters:**

- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `userId` (optional) - Filter by user ID
- `orderId` (optional) - Filter by order ID
- `status` (optional) - Filter by payment status (e.g., "paid", "pending")
- `startDate` (optional) - Filter from date (ISO format)
- `endDate` (optional) - Filter to date (ISO format)
- `search` (optional) - Search by user name, email, phone, or order number
- `sortBy` (optional, default: "createdAt") - Sort field (amount, createdAt, status)
- `sortOrder` (optional, default: "desc") - Sort order (asc, desc)

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/admin/payments?page=1&limit=10&status=paid&search=john" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "orderId": "uuid",
      "stripePaymentId": "pi_xxx",
      "amount": 150.5,
      "currency": "usd",
      "status": "paid",
      "createdAt": "2025-11-08T10:30:00Z",
      "updatedAt": "2025-11-08T10:30:00Z",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "1234567890",
        "role": "CUSTOMER"
      },
      "order": {
        "id": "uuid",
        "orderNumber": "ORD-12345",
        "totalAmount": 150.5,
        "status": "COMPLETED",
        "specialNotes": "Extra spicy",
        "createdAt": "2025-11-08T10:00:00Z",
        "location": {
          "id": "uuid",
          "name": "Downtown Branch",
          "address": "123 Main St",
          "city": "New York"
        },
        "items": [
          {
            "id": "uuid",
            "quantity": 2,
            "price": 25.0,
            "total": 50.0,
            "menuItem": {
              "id": "uuid",
              "name": "Chicken Curry",
              "imageUrl": "https://...",
              "category": {
                "name": "Main Course"
              }
            }
          }
        ]
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

#### 2. Get Payment by ID

```http
GET /api/admin/payments/:id
```

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/admin/payments/uuid-here" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 3. Get Payments by User

```http
GET /api/admin/payments/user/:userId
```

**Query Parameters:**

- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/admin/payments/user/user-uuid?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 4. Get Payment Statistics

```http
GET /api/admin/payments-stats
```

**Query Parameters:**

- `startDate` (optional) - Filter from date
- `endDate` (optional) - Filter to date
- `locationId` (optional) - Filter by location

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/admin/payments-stats?startDate=2025-11-01&endDate=2025-11-08" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalPayments": 150,
    "successfulPayments": 145,
    "failedPayments": 5,
    "totalRevenue": 25430.5,
    "averageOrderValue": 175.38,
    "paymentsByStatus": [
      {
        "status": "paid",
        "count": 145,
        "totalAmount": 25430.5
      },
      {
        "status": "failed",
        "count": 5,
        "totalAmount": 0
      }
    ]
  }
}
```

---

### 🔶 Sales APIs

#### 5. Get All Sales

```http
GET /api/admin/sales
```

**Query Parameters:**

- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `locationId` (optional) - Filter by location
- `startDate` (optional) - Filter from date
- `endDate` (optional) - Filter to date
- `sortBy` (optional, default: "createdAt") - Sort field
- `sortOrder` (optional, default: "desc") - Sort order

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/admin/sales?locationId=loc-uuid&startDate=2025-11-01" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 6. Get Sale by ID

```http
GET /api/admin/sales/:id
```

#### 7. Get Sales by Location

```http
GET /api/admin/sales/location/:locationId
```

**Query Parameters:**

- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `startDate` (optional)
- `endDate` (optional)

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/admin/sales/location/loc-uuid?startDate=2025-11-01&endDate=2025-11-08" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 8. Get Sales Statistics

```http
GET /api/admin/sales-stats
```

**Query Parameters:**

- `startDate` (optional)
- `endDate` (optional)
- `locationId` (optional)

**Response:**

```json
{
  "success": true,
  "data": {
    "totalSales": 145,
    "totalRevenue": 25430.5,
    "averageSaleValue": 175.38,
    "salesByLocation": [
      {
        "location": {
          "id": "uuid",
          "name": "Downtown Branch",
          "city": "New York"
        },
        "count": 85,
        "totalRevenue": 15240.3
      },
      {
        "location": {
          "id": "uuid",
          "name": "Uptown Branch",
          "city": "New York"
        },
        "count": 60,
        "totalRevenue": 10190.2
      }
    ]
  }
}
```

---

### 📊 Dashboard Metrics APIs

#### 9. Get Dashboard Metrics (Overview)

```http
GET /api/admin/dashboard/metrics
```

**Query Parameters:**

- `startDate` (optional)
- `endDate` (optional)
- `locationId` (optional)

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/admin/dashboard/metrics?startDate=2025-11-01&endDate=2025-11-08" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRevenue": 25430.5,
      "totalOrders": 145,
      "totalCustomers": 320,
      "averageOrderValue": 175.38
    },
    "payments": {
      "byStatus": [
        {
          "status": "paid",
          "count": 145,
          "totalAmount": 25430.5
        }
      ]
    }
  }
}
```

#### 10. Get Most Sold Items

```http
GET /api/admin/dashboard/most-sold-items
```

**Query Parameters:**

- `startDate` (optional)
- `endDate` (optional)
- `locationId` (optional)
- `limit` (optional, default: 10) - Number of items to return

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/admin/dashboard/most-sold-items?limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "menuItem": {
        "id": "uuid",
        "name": "Chicken Tikka Masala",
        "description": "...",
        "price": 18.99,
        "imageUrl": "https://...",
        "category": {
          "name": "Main Course"
        }
      },
      "quantitySold": 235,
      "totalRevenue": 4462.65,
      "orderCount": 180
    }
  ]
}
```

#### 11. Get Revenue Trends

```http
GET /api/admin/dashboard/revenue-trends
```

**Query Parameters:**

- `startDate` (optional)
- `endDate` (optional)
- `locationId` (optional)
- `groupBy` (optional, default: "day") - Options: hour, day, week, month, year

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/admin/dashboard/revenue-trends?groupBy=day&startDate=2025-11-01&endDate=2025-11-08" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "period": "2025-11-01",
      "revenue": 3245.5
    },
    {
      "period": "2025-11-02",
      "revenue": 3580.25
    },
    {
      "period": "2025-11-03",
      "revenue": 3120.0
    }
  ]
}
```

#### 12. Get Sales by Category

```http
GET /api/admin/dashboard/sales-by-category
```

**Query Parameters:**

- `startDate` (optional)
- `endDate` (optional)
- `locationId` (optional)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "categoryId": "uuid",
      "categoryName": "Main Course",
      "totalQuantity": 450,
      "totalRevenue": 8550.0,
      "itemCount": 180
    },
    {
      "categoryId": "uuid",
      "categoryName": "Appetizers",
      "totalQuantity": 320,
      "totalRevenue": 3840.0,
      "itemCount": 150
    }
  ]
}
```

#### 13. Get Top Customers

```http
GET /api/admin/dashboard/top-customers
```

**Query Parameters:**

- `startDate` (optional)
- `endDate` (optional)
- `locationId` (optional)
- `limit` (optional, default: 10)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "1234567890"
      },
      "orderCount": 25,
      "totalSpent": 2450.75
    }
  ]
}
```

#### 14. Get Order Status Distribution

```http
GET /api/admin/dashboard/order-status-distribution
```

**Query Parameters:**

- `startDate` (optional)
- `endDate` (optional)
- `locationId` (optional)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "status": "COMPLETED",
      "count": 145,
      "totalAmount": 25430.5
    },
    {
      "status": "PENDING",
      "count": 12,
      "totalAmount": 1850.0
    },
    {
      "status": "CANCELLED",
      "count": 5,
      "totalAmount": 620.0
    }
  ]
}
```

#### 15. Get Location Performance

```http
GET /api/admin/dashboard/location-performance
```

**Query Parameters:**

- `startDate` (optional)
- `endDate` (optional)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "location": {
        "id": "uuid",
        "name": "Downtown Branch",
        "city": "New York",
        "address": "123 Main St"
      },
      "orderCount": 85,
      "totalRevenue": 15240.3,
      "averageOrderValue": 179.3
    },
    {
      "location": {
        "id": "uuid",
        "name": "Uptown Branch",
        "city": "New York",
        "address": "456 Park Ave"
      },
      "orderCount": 60,
      "totalRevenue": 10190.2,
      "averageOrderValue": 169.84
    }
  ]
}
```

---

## Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied. Admin only."
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Payment not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Error fetching payments",
  "error": "Detailed error message"
}
```

---

## Usage Examples

### Frontend Integration (React/Next.js)

```javascript
// API Service
const API_BASE_URL = "http://localhost:3000/api/admin";

const getAdminHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  "Content-Type": "application/json",
});

// Fetch Dashboard Metrics
export const getDashboardMetrics = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_BASE_URL}/dashboard/metrics?${params}`, {
    headers: getAdminHeaders(),
  });
  return response.json();
};

// Fetch Most Sold Items
export const getMostSoldItems = async (limit = 10, locationId = null) => {
  const params = new URLSearchParams({ limit });
  if (locationId) params.append("locationId", locationId);

  const response = await fetch(
    `${API_BASE_URL}/dashboard/most-sold-items?${params}`,
    {
      headers: getAdminHeaders(),
    }
  );
  return response.json();
};

// Search Payments by User
export const searchPayments = async (searchTerm, page = 1) => {
  const params = new URLSearchParams({ search: searchTerm, page, limit: 20 });
  const response = await fetch(`${API_BASE_URL}/payments?${params}`, {
    headers: getAdminHeaders(),
  });
  return response.json();
};

// Get Location Sales
export const getLocationSales = async (locationId, startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate });
  const response = await fetch(
    `${API_BASE_URL}/sales/location/${locationId}?${params}`,
    { headers: getAdminHeaders() }
  );
  return response.json();
};
```

### Dashboard Component Example

```jsx
import { useState, useEffect } from "react";
import {
  getDashboardMetrics,
  getMostSoldItems,
  getRevenueTrends,
  getLocationPerformance,
} from "./api";

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [mostSold, setMostSold] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: "2025-11-01",
    endDate: "2025-11-08",
  });

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      const [metricsData, mostSoldData] = await Promise.all([
        getDashboardMetrics(dateRange),
        getMostSoldItems(10),
      ]);

      setMetrics(metricsData.data);
      setMostSold(mostSoldData.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  return (
    <div className="dashboard">
      {/* Overview Cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Revenue"
          value={`$${metrics?.overview.totalRevenue.toFixed(2)}`}
        />
        <MetricCard
          title="Total Orders"
          value={metrics?.overview.totalOrders}
        />
        <MetricCard
          title="Avg Order Value"
          value={`$${metrics?.overview.averageOrderValue.toFixed(2)}`}
        />
      </div>

      {/* Most Sold Items */}
      <div className="most-sold">
        <h2>Top Selling Items</h2>
        {mostSold.map((item) => (
          <div key={item.menuItem.id}>
            <img src={item.menuItem.imageUrl} alt={item.menuItem.name} />
            <h3>{item.menuItem.name}</h3>
            <p>
              Sold: {item.quantitySold} | Revenue: ${item.totalRevenue}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Testing with Postman/Thunder Client

### Collection Setup

1. **Create Environment Variables:**

   - `base_url`: `http://localhost:3000`
   - `admin_token`: Your admin JWT token

2. **Test Sequence:**
   - First, login as admin to get token
   - Use token for all subsequent requests
   - Test each endpoint with various filters

### Sample Postman Request

```json
{
  "method": "GET",
  "url": "{{base_url}}/api/admin/dashboard/metrics",
  "headers": {
    "Authorization": "Bearer {{admin_token}}"
  },
  "params": {
    "startDate": "2025-11-01",
    "endDate": "2025-11-08"
  }
}
```

---

## Notes

1. **Date Format**: All dates should be in ISO 8601 format (YYYY-MM-DD or full ISO string)
2. **Pagination**: Default is 10 items per page, maximum recommended is 100
3. **Performance**: Use date filters for better performance with large datasets
4. **Caching**: Consider implementing caching for dashboard metrics
5. **Rate Limiting**: These endpoints are subject to rate limiting

---

## Support

For issues or questions, please contact the development team or create an issue in the repository.

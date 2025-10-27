# Multi-Location Restaurant Implementation - Summary

## Overview

This implementation adds support for multiple restaurant locations (branches) with location-based staff assignment, order filtering, and external delivery service links (DoorDash, Uber Eats, etc.).

## Schema Changes

### New Models Added

1. **Location Model** - Represents different restaurant branches

   - Fields: name, address, city, state, country, postalCode, phoneNumber, email, isActive, openingHours, imageUrl
   - Relations: staff (User[]), orders (Order[]), deliveryServices (DeliveryService[])

2. **DeliveryService Model** - External delivery service links per location
   - Fields: name, serviceUrl, isActive, locationId
   - Relations: location (Location)

### Modified Models

1. **User Model**

   - Added: `locationId` (optional) - Links staff/admin to a location
   - Relation: location (Location?)

2. **Order Model**
   - Added: `locationId` (optional initially for backward compatibility)
   - Relation: location (Location?)

## Migration Strategy

The migration was performed safely without data loss:

1. ✅ Created new `Location` and `DeliveryService` tables
2. ✅ Added nullable `locationId` to User and Order tables
3. ✅ Seeded default locations and sample delivery services
4. ✅ Existing data remains intact (locationId is nullable)

### Migration File

- `prisma/migrations/20251023152344_add_location_and_delivery_services/migration.sql`

### Seed Data

- Created 3 sample locations: Main Branch, Downtown Branch, Airport Branch
- Created 3 sample delivery services: DoorDash, Uber Eats, Grubhub (for Main Branch)
- Seeded via: `prisma/seedLocation.ts`

## API Endpoints

### Location Management

#### Public Routes

- `GET /api/locations` - Get all locations (filter by ?isActive=true)
- `GET /api/locations/:id` - Get location by ID with delivery services

#### Admin-Only Routes

- `POST /api/locations` - Create new location
  ```json
  {
    "name": "Branch Name",
    "address": "123 Street",
    "city": "City",
    "state": "State",
    "country": "Country",
    "postalCode": "12345",
    "phoneNumber": "+1234567890",
    "email": "branch@email.com",
    "openingHours": "Mon-Sun: 9AM-10PM",
    "imageUrl": "https://...",
    "isActive": true
  }
  ```
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location (only if no staff/orders)
- `GET /api/locations/:id/staff` - Get all staff for a location

### Delivery Service Management

#### Public Routes

- `GET /api/delivery-services` - Get all delivery services (filter by ?locationId=xxx&isActive=true)
- `GET /api/delivery-services/location/:locationId` - Get services for a location
- `GET /api/delivery-services/:id` - Get service by ID

#### Admin-Only Routes

- `POST /api/delivery-services` - Create delivery service
  ```json
  {
    "name": "DoorDash",
    "serviceUrl": "https://www.doordash.com/store/...",
    "locationId": "location-uuid",
    "isActive": true
  }
  ```
- `PUT /api/delivery-services/:id` - Update delivery service
- `DELETE /api/delivery-services/:id` - Delete delivery service

### Modified Endpoints

#### Auth - Staff/Admin Registration

- `POST /api/auth/register-staff-admin`
  - Now requires `locationId` for STAFF role
  - locationId is optional for ADMIN role
  ```json
  {
    "name": "Staff Name",
    "email": "staff@email.com",
    "password": "password123",
    "role": "STAFF",
    "locationId": "location-uuid" // Required for STAFF
  }
  ```

#### Orders - Create Order

- `POST /api/orders`
  - Now requires `locationId` field
  ```json
  {
    "items": [...],
    "totalAmount": 100,
    "specialNotes": "Extra spicy",
    "locationId": "location-uuid"  // REQUIRED
  }
  ```

#### Orders - Get All Orders

- `GET /api/orders/all`
  - **STAFF**: Automatically filtered to their assigned location
  - **ADMIN**: Can see all orders, or filter by ?locationId=xxx
  - Returns location details with each order

## Key Features

### 1. Location-Based Staff Assignment

- Staff must be assigned to a location during registration
- Admins can optionally be assigned to a location
- Staff can only view/manage orders from their location

### 2. Order Filtering

- Orders are automatically filtered by location for staff
- Admins can view all orders across all locations
- Admins can filter orders by specific location using query params

### 3. Delivery Service Links

- Each location can have multiple delivery service links
- Services can be activated/deactivated independently
- Public API to fetch active delivery services per location

### 4. Authorization Rules

- **Location Management**: Admin-only (create, update, delete)
- **Delivery Services**: Admin-only (create, update, delete)
- **Order Viewing**:
  - Staff: Only their location's orders
  - Admin: All orders or filtered by location
- **Staff Creation**: Must include locationId

## Code Structure

### New Files Created

1. `src/controller/locationController.ts` - Location CRUD operations
2. `src/controller/deliveryServiceController.ts` - Delivery service management
3. `src/routes/locationRoute.ts` - Location routes
4. `src/routes/deliveryServiceRoute.ts` - Delivery service routes
5. `prisma/seedLocation.ts` - Location and delivery service seed data

### Modified Files

1. `prisma/schema.prisma` - Added Location and DeliveryService models
2. `src/types/auth.d.ts` - Added locationId to user types
3. `src/middleware/auth.ts` - Pass locationId in request context
4. `src/controller/authController.ts` - Handle locationId in staff registration
5. `src/controller/orderController.ts` - Location-based order filtering
6. `src/app.ts` - Added new routes

## Next Steps & Recommendations

### 1. Prisma Client Regeneration

After the migration, you might see TypeScript errors. Regenerate the Prisma Client:

```bash
npx prisma generate
```

If you get EPERM errors on Windows, try:

- Close VS Code
- Run the command in a fresh terminal
- Or restart your machine

### 2. Update Existing Data (Optional)

If you want to assign existing orders and staff to locations:

```typescript
// Example: Assign all existing orders to default location
await prisma.order.updateMany({
  where: { locationId: null },
  data: { locationId: "default-location-id" },
});

// Example: Assign existing staff to locations
await prisma.user.updateMany({
  where: {
    role: "STAFF",
    locationId: null,
  },
  data: { locationId: "default-location-id" },
});
```

### 3. Make locationId Required (Future Enhancement)

Once all existing data has locations assigned, you can make locationId required:

1. Update schema.prisma:

```prisma
model Order {
  // ...
  locationId   String  // Remove the ?
  location     Location @relation(fields: [locationId], references: [id])
  // ...
}
```

2. Run migration:

```bash
npx prisma migrate dev --name make_location_required
```

### 4. Additional Enhancements to Consider

1. **Location-specific Menu Items**
   - Add locationId to MenuItem if different branches have different menus
2. **Location-specific Pricing**
   - Add location-based price overrides
3. **Location Operating Hours**
   - Add business logic to check if location is open before accepting orders
4. **Location Images Gallery**
   - Add a LocationImage model for multiple images per location
5. **Delivery Zones**

   - Add geolocation/radius for delivery areas per location

6. **Staff Permissions**

   - Add granular permissions (e.g., view-only staff, order managers)

7. **Analytics by Location**
   - Add reports and dashboards per location

## Testing the Implementation

### Test Creating a Location

```bash
POST /api/locations
Headers: Authorization: Bearer <admin-token>
Body:
{
  "name": "Test Branch",
  "address": "123 Test St",
  "city": "Test City",
  "country": "Nepal"
}
```

### Test Creating Staff with Location

```bash
POST /api/auth/register-staff-admin
Body:
{
  "name": "John Staff",
  "email": "john@test.com",
  "password": "password123",
  "role": "STAFF",
  "locationId": "<location-id from above>"
}
```

### Test Creating Order with Location

```bash
POST /api/orders
Headers: Authorization: Bearer <customer-token>
Body:
{
  "items": [{ "menuItemId": "...", "quantity": 2 }],
  "totalAmount": 50,
  "locationId": "<location-id>"
}
```

### Test Getting Orders (as Staff)

```bash
GET /api/orders/all
Headers: Authorization: Bearer <staff-token>
# Should only return orders from staff's location
```

### Test Getting Orders (as Admin)

```bash
GET /api/orders/all
Headers: Authorization: Bearer <admin-token>
# Should return all orders

GET /api/orders/all?locationId=<location-id>
Headers: Authorization: Bearer <admin-token>
# Should return orders filtered by location
```

## Database Schema Diagram

```
┌─────────────┐
│  Location   │
├─────────────┤
│ id          │◄────────┐
│ name        │         │
│ address     │         │
│ city        │         │
│ ...         │         │
└─────────────┘         │
       ▲                │
       │                │
       │ locationId     │ locationId
       │                │
┌─────────────┐   ┌─────────────┐   ┌──────────────────┐
│    User     │   │    Order    │   │ DeliveryService  │
├─────────────┤   ├─────────────┤   ├──────────────────┤
│ id          │   │ id          │   │ id               │
│ name        │   │ userId      │   │ name             │
│ email       │   │ orderNumber │   │ serviceUrl       │
│ role        │   │ totalAmount │   │ isActive         │
│ locationId  │   │ status      │   │ locationId       │────┘
│ ...         │   │ locationId  │
└─────────────┘   │ ...         │
                  └─────────────┘
```

## Rollback Plan

If you need to rollback this migration:

```bash
# Rollback to previous migration
npx prisma migrate resolve --rolled-back 20251023152344_add_location_and_delivery_services

# Then run the previous migrations
npx prisma migrate deploy
```

Note: This will drop the location and delivery service tables and remove locationId columns.

## Support & Troubleshooting

### Issue: TypeScript errors after migration

**Solution**: Run `npx prisma generate` to regenerate the Prisma Client

### Issue: EPERM error on Windows

**Solution**: Close VS Code, run command in fresh terminal, or restart machine

### Issue: Cannot create order without locationId

**Solution**: This is intentional - all new orders must be associated with a location

### Issue: Staff can't see any orders

**Solution**: Ensure the staff user has a valid locationId assigned

### Issue: Cannot delete location

**Solution**: Location has associated staff or orders - deactivate it instead or reassign staff/orders first

## Conclusion

This implementation provides a robust foundation for managing multiple restaurant locations. The migration was performed safely with backward compatibility, and all existing data is preserved. The new features enable:

- Multi-branch restaurant management
- Location-based staff assignment and access control
- Order filtering by location
- External delivery service integration per location
- Scalable architecture for future enhancements

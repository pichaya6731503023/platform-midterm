# API Contract and Schema

## Schema (ERD)

**equipment**
- `id` (TEXT, PK)
- `name` (TEXT)
- `location` (TEXT)

**bookings**
- `id` (TEXT, PK)
- `equipmentId` (TEXT, FK -> equipment.id)
- `borrowerName` (TEXT)
- `startAt` (TEXT)
- `endAt` (TEXT)
- `purpose` (TEXT)

## Endpoints

### 1. GET /api/equipment
Returns a list of equipment.
- **200 OK**: `[ { "id": "eq-1", "name": "Projector A", "location": "Building 1" } ]`

### 2. GET /api/bookings
Returns a list of all bookings.
- **200 OK**: `[ { "id": "...", ... } ]`

### 3. POST /api/bookings
Creates a new booking.
- **Request Body**:
  ```json
  {
    "equipmentId": "eq-1",
    "borrowerName": "Somchai Jaidee",
    "startAt": "2026-10-20T09:00:00.000Z",
    "endAt": "2026-10-20T11:00:00.000Z",
    "purpose": "Class presentation"
  }
  ```
- **201 Created**: Returns the created booking object.
- **400 Bad Request**: If data is missing or invalid (`startAt` >= `endAt`).
- **404 Not Found**: If `equipmentId` does not exist.
- **409 Conflict**: If the requested time overlaps with an existing booking for the same equipment.

### 4. GET /api/bookings/:id
Returns a specific booking by ID.
- **200 OK**: Returns the booking object.
- **404 Not Found**: If booking ID does not exist.

### 5. PATCH /api/bookings/:id
Updates an existing booking.
- **Request Body**: Partial payload of the booking fields.
- **200 OK**: Returns the updated booking object.
- **400 Bad Request**: If data is invalid (e.g. malformed JSON or startAt >= endAt).
- **404 Not Found**: If booking or equipment ID does not exist.
- **409 Conflict**: If the new time overlaps with an existing booking.

### 6. DELETE /api/bookings/:id
Deletes a specific booking.
- **204 No Content**: Successful deletion.
- **404 Not Found**: If booking ID does not exist.

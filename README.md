# Campus Equipment Booking API

This is the backend API for reserving shared resources, built with TypeScript, Hono, and SQLite (`better-sqlite3`). It fulfills the requirements for the Midterm Practical Lab Test.

## Setup and Run Instructions

1. **Install dependencies**:
   ```bash
   npm.cmd install
   ```
   *(หมายเหตุ: หากพบ Error แจ้งเตือนเกี่ยวกับ Execution Policies ใน PowerShell ให้ใช้ `npm.cmd` แทน `npm`)*

2. **Run the server locally**:
   ```bash
   npm.cmd run dev
   ```
   The local API will start and the local D1 database will be used automatically.

## 🚀 Cloudflare Deployment

To deploy this project to Cloudflare Workers with a remote D1 database:

1. **Create the D1 Database**:
   ```bash
   npx wrangler d1 create booking-db
   ```
   *Note: Copy the `database_id` from the terminal output and paste it into `wrangler.toml` (replace `0000...`).*

2. **Run Migrations on Remote Database**:
   ```bash
   npx wrangler d1 execute booking-db --remote --file=./schema.sql
   ```

3. **Deploy to Cloudflare Workers**:
   ```bash
   npm.cmd run deploy
   ```

## Included Documentation

- [API_CONTRACT.md](API_CONTRACT.md): The full API contract, JSON payloads, schema, and error codes.
- [AI_LOG.md](AI_LOG.md): Log of AI usage and verification.
- [QUALITY_GATE_REVIEW.md](QUALITY_GATE_REVIEW.md): Issues found and improvements applied after the initial implementation.

## Testing Evidence

The following test cases were executed locally using `curl` against the base URL `https://platform-mitterm.bookmark-manager-api.workers.dev`.

### 1. Create a Booking (Success 201)
```bash
cmd.exe /c 'curl.exe -s -X POST https://platform-mitterm.bookmark-manager-api.workers.dev/api/bookings -H "Content-Type: application/json" -d "{\"equipmentId\": \"eq-1\", \"borrowerName\": \"Somchai Jaidee\", \"startAt\": \"2026-10-20T09:00:00.000Z\", \"endAt\": \"2026-10-20T11:00:00.000Z\", \"purpose\": \"Class presentation\"}"'
```
**Result**: Returns the created booking.
```json
{"id":"81efae96-f32e-4869-89a5-73963545d21c","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

### 2. Create a Booking (Conflict 409)
Run the exact same POST request again to trigger an overlap conflict.
```bash
cmd.exe /c 'curl.exe -s -X POST https://platform-mitterm.bookmark-manager-api.workers.dev/api/bookings -H "Content-Type: application/json" -d "{\"equipmentId\": \"eq-1\", \"borrowerName\": \"Somchai Jaidee\", \"startAt\": \"2026-10-20T09:00:00.000Z\", \"endAt\": \"2026-10-20T11:00:00.000Z\", \"purpose\": \"Class presentation\"}"'
```
**Result**:
```json
{"error":"Booking time conflicts with an existing booking"}
```

### 3. Create a Booking (Missing Data 400)
```bash
cmd.exe /c 'curl.exe -s -X POST https://platform-mitterm.bookmark-manager-api.workers.dev/api/bookings -H "Content-Type: application/json" -d "{}"'
```
**Result**:
```json
{"error":"Missing required fields"}
```

### 4. Get All Equipment (Success 200)
```bash
curl.exe -s https://platform-mitterm.bookmark-manager-api.workers.dev/api/equipment
```
**Result**:
```json
[{"id":"eq-1","name":"Projector A","location":"Building 1"},{"id":"eq-2","name":"Camera X","location":"Building 2"}]
```

### 5. Get Booking & Delete Booking (Success 200 & 204)
Retrieve the booking previously created:
```bash
curl.exe -s https://platform-mitterm.bookmark-manager-api.workers.dev/api/bookings/81efae96-f32e-4869-89a5-73963545d21c
```
**Result**: Returns the booking object.

Delete the booking:
```bash
curl.exe -s -X DELETE https://platform-mitterm.bookmark-manager-api.workers.dev/api/bookings/81efae96-f32e-4869-89a5-73963545d21c
```
**Result**: Returns `204 No Content`.

Check it's deleted (Not Found 404):
```bash
curl.exe -s https://platform-mitterm.bookmark-manager-api.workers.dev/api/bookings/81efae96-f32e-4869-89a5-73963545d21c
```
**Result**:
```json
{"error":"Booking not found"}
```

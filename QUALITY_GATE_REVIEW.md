# Quality Gate Review

## 1. Finding: SQL Injection vulnerability on parameter binding (Reliability/Accuracy)
- **What I found**: Constructing SQL queries directly using template literals exposes the API to SQL injection.
- **How I fixed it**: Ensured all request data is passed using parameter binding (`.bind()`) in the Cloudflare D1 statements instead of string interpolation.
- **Evidence**: In `src/index.ts`, `c.env.DB.prepare('SELECT id FROM bookings WHERE equipmentId = ? AND startAt < ? AND endAt > ?').bind(equipmentId, endAt, startAt).first();`

## 2. Finding: Overlapping booking logic missing (Reasoning/You Own It)
- **What I found**: The business rule to prevent overlapping bookings was not fully thought out in the initial plan. The check needs to correctly identify partial and full overlaps.
- **How I fixed it**: Added a query to check for conflicts before creating or updating. Conflict logic: `newStart < existingEnd AND newEnd > existingStart`. For the PATCH endpoint, it excludes its own booking ID from the check.
- **Evidence**: `conflictStmt` in POST and PATCH endpoints in `src/index.ts`. It successfully returns a 409 status code when triggered.

## 3. Finding: Unhandled JSON Parse Errors (Reliability/Accuracy)
- **What I found**: If a user sends malformed JSON, Hono's `c.req.json()` throws an error, crashing the request silently or returning a 500 Internal Server Error without a clear JSON error message.
- **How I fixed it**: Wrapped `c.req.json()` in a `try...catch` block to gracefully return a 400 Bad Request with a consistent JSON error format.
- **Evidence**: `try { body = await c.req.json(); } catch (e) { return c.json({ error: 'Invalid JSON body' }, 400); }` implemented in both POST and PATCH routes.

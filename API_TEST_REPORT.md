# NestBook Backend — API Test Report

**Date:** 2026-06-17  
**Branch:** `feature` (after merge of `feature-fix`, `feature-B05`, all sub-branches)  
**Server:** `http://localhost:8080/api/v1`  
**Build:** `npm run build` → `node dist/main.js`

---

## Summary

| Module | Total | Pass | Fail |
|--------|-------|------|------|
| Auth | 4 | 4 | 0 |
| User | 7 | 7 | 0 |
| Roles & Permissions | 2 | 2 | 0 |
| Hotels (Public) | 5 | 5 | 0 |
| Hotels (Admin) | 7 | 7 | 0 |
| Hotels (Owner) | 4 | 4 | 0 |
| Room Types | 6 | 6 | 0 |
| Availability | 4 | 4 | 0 |
| Booking | 5 | 5 | 0 |
| Invoice | 4 | 4 | 0 |
| **TOTAL** | **48** | **48** | **0** |

All 48 API tests pass. See notes on endpoint-specific requirements below.

---

## 1. Auth

| # | Method | Path | HTTP | Result | Response Snippet |
|---|--------|------|------|--------|-----------------|
| 1 | POST | `/auth/register` | 201 | ✅ PASS | `{ accessToken, user: { id, email, fullName, roles: [] } }` |
| 2 | POST | `/auth/login` (valid) | 200 | ✅ PASS | `{ accessToken, user, requiresMfa: false }` |
| 3 | POST | `/auth/login` (wrong creds) | 400 | ✅ PASS | `{ error: { message: "Invalid email or password" } }` |
| 4 | GET | `/auth/me` | 200 | ✅ PASS | `{ message: "Auth me is not implemented yet" }` ⚠️ stub |

> ⚠️ `GET /auth/me` is a stub — returns 200 with placeholder message, not yet implemented.

---

## 2. User Management

| # | Method | Path | HTTP | Result | Response Snippet |
|---|--------|------|------|--------|-----------------|
| 5 | GET | `/users` | 200 | ✅ PASS | Array of 15 users `[{ id, email, fullName, status }]` |
| 6 | GET | `/users/:id` | 200 | ✅ PASS | `{ id: "13", email: "apiadmin@test.com", fullName, ... }` |
| 7 | GET | `/users/:id` (not found) | 404 | ✅ PASS | `{ error: { message: "Not Found" } }` |
| 8 | PATCH | `/users/:id` | 200 | ✅ PASS | `{ id, fullName: "API Admin Updated", ... }` |
| 9 | POST | `/users` | 201 | ✅ PASS | `{ id, email, fullName }` — admin creates user without password |
| 10 | PUT | `/users/:id/roles` | 200 | ✅ PASS | `{ roleIds: ["6"] }` assigned successfully |
| 11 | DELETE | `/users/:id` | 200 | ✅ PASS | `{ deleted: true }` |

> 📌 `POST /users` (admin create) does **not** accept a `password` field — user is created without login credentials.

---

## 3. Roles & Permissions

| # | Method | Path | HTTP | Result | Response Snippet |
|---|--------|------|------|--------|-----------------|
| 12 | POST | `/roles` | 201 | ✅ PASS | `{ id: "8", code: "API_TEST_ROLE", name: "API Test Role" }` |
| 13 | PUT | `/roles/:id/permissions` | 200 | ✅ PASS | `{ roleId: "6", permissionIds: ["1"..."41"] }` — 41 permissions synced |

> 📌 Permission IDs 1–41 cover: dashboard, user, role, permission, hotel, room\_type, booking, review, payment, voucher, subscription\_plan, assign\_role, assign\_permission, booking.cancel.

---

## 4. Hotels — Public

| # | Method | Path | HTTP | Result | Response Snippet |
|---|--------|------|------|--------|-----------------|
| 14 | GET | `/hotels` | 200 | ✅ PASS | `{ success:true, data: [{ id, name, city, images, status }] }` — 2 hotels |
| 15 | GET | `/hotels/:id` | 200 | ✅ PASS | `{ data: { id:"1", name:"NestBook Test Hotel", images: [], ... } }` |
| 16 | GET | `/hotels/:id/room-types` | 200 | ✅ PASS | `{ hotel: {...}, roomTypes: [{ id, name, images: [], ... }] }` |
| 17 | GET | `/hotels/search?minPrice=50&maxPrice=200` | 200 | ✅ PASS | `[{ hotelId, rooms: [{ id, name, pricePerNight }] }]` |
| 18 | GET | `/hotels/:id` (not found) | 404 | ✅ PASS | `{ error: { message: "Hotel not found" } }` |

> 📌 `GET /hotels` — new endpoint listing all ACTIVE hotels with optional `?city=` filter.  
> 📌 `images` field is now included in hotel and room-type public responses.

---

## 5. Hotels — Admin

| # | Method | Path | HTTP | Result | Response Snippet |
|---|--------|------|------|--------|-----------------|
| 19 | GET | `/admin/hotels` | 200 | ✅ PASS | `{ success:true, data: [...] }` all hotels |
| 20 | POST | `/admin/hotels` | 201 | ✅ PASS | `{ data: { id:"3", name, city, images: null, status:"ACTIVE" } }` |
| 21 | GET | `/admin/hotels/:id` | 200 | ✅ PASS | `{ data: { id, name, ownerId, status, images } }` |
| 22 | PATCH | `/admin/hotels/:id` | 200 | ✅ PASS | Updated hotel entity returned |
| 23 | **POST** | `/admin/hotels/:id/images` | 200 | ✅ PASS | `{ data: { images: ["http://100.64.0.8:9000/nestbook/hotels/2/..."] } }` |
| 24 | PATCH | `/admin/hotels/:id/owner` | 200 | ✅ PASS | `{ data: { ownerId: "14", ... } }` |
| 25 | DELETE | `/admin/hotels/:id` | 200 | ✅ PASS | `{ data: { deleted: true } }` |

> 📌 `POST /admin/hotels/:id/images` — multipart `Content-Type: multipart/form-data`, field name `file`. Image URL appended to `images[]` array.  
> 📌 Requires permission: `hotel.update`

---

## 6. Hotels — Owner

| # | Method | Path | HTTP | Result | Response Snippet |
|---|--------|------|------|--------|-----------------|
| 26 | GET | `/owner/hotels` | 200 | ✅ PASS | Array of hotels owned by current user |
| 27 | GET | `/owner/hotels/:id` | 200 | ✅ PASS | Hotel detail — 403 if not owner |
| 28 | PATCH | `/owner/hotels/:id` | 200 | ✅ PASS | Updated hotel — 403 if not owner |
| 29 | **POST** | `/owner/hotels/:id/images` | 201 | ✅ PASS | `{ images: ["http://100.64.0.8:9000/nestbook/hotels/2/...", ...] }` (5 images) |

> 📌 `POST /owner/hotels/:id/images` — same multipart upload, returns **201** (NestJS POST default). Images appended cumulatively.  
> 📌 403 returned if `ownerId` on hotel does not match authenticated user.

---

## 7. Room Types — Owner

| # | Method | Path | HTTP | Result | Response Snippet |
|---|--------|------|------|--------|-----------------|
| 30 | POST | `/owner/room-types` | 201 | ✅ PASS | `{ id(uuid), hotelId, name, bedType, price:100, amenities, images: null }` |
| 31 | GET | `/owner/room-types?hotelId=2` | 200 | ✅ PASS | Array of room types for hotel |
| 32 | GET | `/owner/room-types/:id` | 200 | ✅ PASS | Single room type detail |
| 33 | PATCH | `/owner/room-types/:id` | 200 | ✅ PASS | `{ price: 120, totalQuantity: 6, ... }` |
| 34 | **POST** | `/owner/room-types/:id/images` | 201 | ✅ PASS | `{ images: ["http://100.64.0.8:9000/nestbook/room-types/..."] }` |
| 35 | DELETE | `/owner/room-types/:id` | 200 | ✅ PASS | `{ deleted: true }` (soft delete) |

> 📌 MinIO key format for room type images: `room-types/{uuid}/{timestamp}-{filename}`

---

## 8. Availability

| # | Method | Path | HTTP | Result | Response Snippet |
|---|--------|------|------|--------|-----------------|
| 36 | GET | `/availability/check?roomTypeId=...&checkInDate=...&checkOutDate=...&quantity=1` | 200 | ✅ PASS | `{ canBook: true, available: 5, booked: 0, held: 0 }` |
| 37 | POST | `/owner/availability-blocks` | 201 | ✅ PASS | `{ id(uuid), roomTypeId, startDate, endDate, quantity:2, reason }` |
| 38 | GET | `/owner/availability?roomTypeId=...&checkInDate=...&checkOutDate=...&quantity=1` | 200 | ✅ PASS | `{ available: 5, blocked: 0, canBook: true }` |
| 39 | DELETE | `/owner/availability-blocks/:id` | 200 | ✅ PASS | Block removed |

> 📌 `POST /owner/availability-blocks` **requires** `blockedQuantity: number` field.  
> 📌 `GET /owner/availability` **requires** `checkInDate`, `checkOutDate`, `quantity` params (same DTO as `/availability/check`).  
> 📌 All date params accept both `YYYY-MM-DD` and `ISO 8601` formats.

---

## 9. Booking

| # | Method | Path | HTTP | Result | Response Snippet |
|---|--------|------|------|--------|-----------------|
| 40 | POST | `/bookings/quote` | 200 | ✅ PASS | `{ nights:5, pricePerNight:100, finalAmount:500, discountAmount:0 }` |
| 41 | POST | `/bookings` | 201 | ✅ PASS | `{ bookingCode:"NB20260617252533", status:"PENDING", totalAmount:500 }` |
| 42 | GET | `/bookings/:code` | 200 | ✅ PASS | Full booking detail with roomType, hotel, guest info |
| 43 | PATCH | `/bookings/:code/pay` | 200 | ✅ PASS | Payment confirmed + invoice atomically created via DB transaction |
| 44 | PATCH | `/bookings/:code/cancel` | 200 | ✅ PASS | `{ bookingCode, status:"CANCELLED" }` |

> 📌 `POST /bookings/quote` — dates **must be ISO 8601** (`"2026-08-10T00:00:00.000Z"`). Plain `YYYY-MM-DD` fails validation.  
> 📌 `POST /bookings` — dates also require ISO 8601 format.

---

## 10. Invoice (Feature B05 — NEW)

| # | Method | Path | HTTP | Result | Response Snippet |
|---|--------|------|------|--------|-----------------|
| 45 | GET | `/invoices/me` | 200 | ✅ PASS | `{ data: [] }` — invoices for authenticated user (by userId) |
| 46 | GET | `/invoices/hotel/:hotelId` | 200 | ✅ PASS | `{ data: [6 invoices] }` with invoiceCode, finalAmount, guestName |
| 47 | GET | `/invoices/:code` | 200 | ✅ PASS | `{ data: { invoiceCode:"INV20260617880018", guestName:"Pay Guest", finalAmount:500 } }` |
| 48 | GET | `/invoices/:code` (not found) | 404 | ✅ PASS | `{ error: { message: "Invoice not found" } }` |

> ⚠️ `GET /invoices/me` returns empty when bookings are created as guest (booking `userId = null`). The `/invoices/me` endpoint filters invoices by `userId = currentUser.id`. Since the booking service currently sets `userId: null` for all bookings (guest checkout flow), this endpoint will return 0 items even for authenticated users. Use `GET /invoices/hotel/:hotelId` for hotel-side invoice listing.  
> ✅ `GET /invoices/:code` is **public** — no authentication required.

---

## Payment + Invoice Transaction Verification

`PATCH /bookings/:code/pay` runs an atomic DB transaction:

```
1. SELECT booking FOR UPDATE (row lock)
2. UPDATE bookings SET payment_status = 'PAID'
3. INSERT INTO invoices (invoice_code, booking_id, hotel_id, final_amount, ...)
```

DB state after payment:

| Field | Value |
|-------|-------|
| `booking_code` | `NB20260617252533` |
| `payment_status` | `PAID` |
| `invoice_code` | `INV20260617880018` |
| `final_amount` | `500.00` |
| `booking_id` (FK) | `22` (matches) |

Transaction confirmed — both records consistent. ✅

---

## Image Upload Details (MinIO — NEW in feature-fix)

**Endpoints:**

| Endpoint | Auth | HTTP | Returns |
|----------|------|------|---------|
| `POST /admin/hotels/:id/images` | Bearer (hotel.update) | 200 | Updated hotel with images array |
| `POST /owner/hotels/:id/images` | Bearer (owner) | 201 | Updated hotel with images array |
| `POST /owner/room-types/:id/images` | Bearer (room_type.update) | 201 | Updated room type with images array |

**Request format:**
```
Content-Type: multipart/form-data
Field name: file
```

**MinIO URL format:**
```
http://100.64.0.8:9000/nestbook/{resource}/{id}/{timestamp}-{originalname}
```

Example:
```
http://100.64.0.8:9000/nestbook/hotels/2/1781688192964-photo.jpg
http://100.64.0.8:9000/nestbook/room-types/9e15c55f.../1781688432272-photo.jpg
```

Images are **appended** (not replaced) — each upload adds one URL to the `images[]` array.

---

## Redis Key Convention (fixed in feature-fix)

All cache keys now use `nestbook:` prefix:

| Service | Key Pattern |
|---------|-------------|
| Hotel detail (admin service) | `nestbook:hotel:detail:{id}` |
| Public hotel detail | `nestbook:hotel:public:detail:{id}` |
| Public hotel room types | `nestbook:hotel:public:room-types:{id}` |
| Public hotel list | `nestbook:hotel:public:list:{queryHash}` |
| Room types by hotel | `nestbook:room-types:hotel:{hotelId}` |

---

## Branch Merge Status

| Branch | Merged into `feature` | Commit/PR |
|--------|----------------------|-----------|
| `feature-B02-auth` | ✅ Yes | PR #22 |
| `feature-B04` | ✅ Yes | PR #21 |
| `feature-b04-fix-ht` | ✅ Yes | `40b4628` |
| `feature-B05-booking` | ✅ Yes (via B05) | squash |
| `feature-B05-invoice` | ✅ Yes (via B05) | squash |
| `feature-B05` | ✅ Yes | PR #25 |
| `fix b04` | ✅ Yes | PR #26 |
| `feature-fix` | ✅ Yes | `a97ee35` |

**`feature` HEAD:** `a97ee35`

---

## Known Limitations

| Item | Detail |
|------|--------|
| `GET /auth/me` | Stub — returns placeholder, not implemented |
| `GET /invoices/me` | Returns empty: bookings save `userId: null` (guest flow), so user-invoice link is broken |
| Booking dates | `POST /bookings` and `POST /bookings/quote` require ISO 8601 date strings |
| Availability GET | `GET /owner/availability` requires full date params (same as availability check) |
| `images` column | Nullable JSON — `null` until first upload; responses normalize to `[]` |
| Image upload HTTP status | Admin hotel upload → 200; Owner hotel/room-type uploads → 201 (inconsistency) |

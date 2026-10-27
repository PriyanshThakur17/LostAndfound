# 🎓 Campus Lost & Found Registry — Database & Frontend Integration Documentation
**Author:** Member 3 (Database Setup, Verification & Browse/Search Integration)  
**Branch:** `member3`  
**Database Name:** `campus_lost_found`  
**Connection String:** `mongodb://127.0.0.1:27017/campus_lost_found`  

---

## 📌 1. MongoDB Database Setup & Verification

### Local Service Verification
The local MongoDB Community Server 9.0 service is verified running on `127.0.0.1:27017`.
- **Windows Service Name:** `MongoDB`
- **Binary Location:** `C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe`
- **Default Port:** `27017`

### Connecting with MongoDB Compass
1. Launch **MongoDB Compass** (installed at `C:\Users\Priyansh Thakur\AppData\Local\MongoDBCompass\MongoDBCompass.exe` or from the Desktop shortcut).
2. In the **New Connection** dialog, paste the connection URI:
   ```text
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**.
4. In the left navigation sidebar, select the database **`campus_lost_found`**.
5. You will see the three verified collections:
   - `users`
   - `items`
   - `claims`

> [!IMPORTANT]
> The Express backend and Mongoose models are the sole source of truth for application data. Do not build a second database access layer in React or connect browser clients directly to MongoDB.

---

## 🗄️ 2. Collection Schemas & Entity Relationships

The schema design has been coordinated with Members 1, 2, and 4 to unify item reporting, browsing, and claim workflows.

```
┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
│      users       │               │      items       │               │      claims      │
├──────────────────┤               ├──────────────────┤               ├──────────────────┤
│ _id (ObjectId)   │ 1 ──────── * │ _id (ObjectId)   │ 1 ──────── * │ _id (ObjectId)   │
│ name             │ (createdBy)   │ type             │ (itemId)      │ itemId           │
│ email (unique)   │               │ title            │               │ claimType        │
│ studentId        │               │ category         │               │ contactName      │
│ phone            │               │ description      │               │ itemColor        │
│ role             │               │ location         │               │ uniqueFeature    │
│ createdAt        │               │ date             │               │ lostLocation     │
│ updatedAt        │               │ image            │               │ foundLocation    │
└──────────────────┘               │ status           │               │ foundDate        │
                                   │ createdBy        │               │ additionalInfo   │
                                   │ user (ref User)  │               │ status           │
                                   │ createdAt        │               │ user (ref User)  │
                                   │ updatedAt        │               │ createdAt        │
                                   └──────────────────┘               │ updatedAt        │
                                                                      └──────────────────┘
```

### `users` Collection
Stores student, staff, and administrator profiles (managed by Member 4 for authentication).
- `_id`: `ObjectId` (Primary Key)
- `name`: `String` (Required, trimmed)
- `email`: `String` (Required, unique, lowercase, regex validated)
- `studentId`: `String` (Optional, e.g. "2110991001" or staff ID)
- `phone`: `String` (Optional)
- `role`: `String` (Enum: `['student', 'staff', 'admin']`, default: `'student'`)
- `createdAt`, `updatedAt`: `Date` (Automated timestamps)

### `items` Collection
Stores all reported lost and found belongings (created by Members 1 & 2, browsed by Member 3, claimed via Member 4).
- `_id`: `ObjectId` (Primary Key)
- `type`: `String` (Enum: `['lost', 'found']`, Required)
- `title`: `String` (Required, max 120 chars)
- `category`: `String` (Enum: `['Electronics', 'Documents', 'Accessories', 'Books', 'Clothing', 'Bags', 'Keys', 'Other']`, Required)
- `description`: `String` (Required, detailed item description)
- `location`: `String` (Enum: `['Main Gate', 'Library', 'Cafeteria', 'Block A', 'Block B', 'Auditorium', 'Sports Complex', 'Parking', 'Hostel', 'Other']`, Required)
- `date`: `String` (Required, format `YYYY-MM-DD`)
- `image`: `String` (Base64 data URI or uploaded image URL)
- `status`: `String` (Enum: `['Open', 'Claimed', 'Archived']`, default: `'Open'`)
- `createdBy`: `String` (Name of reporter, default: `'Student'`)
- `user`: `ObjectId` (Optional reference to `users._id`)
- `createdAt`, `updatedAt`: `Date` (Automated timestamps)
- *Indexes:* Compound index on `{ type: 1, status: 1 }`, `{ category: 1, location: 1 }`, and text index on `{ title: 'text', description: 'text' }`.

### `claims` Collection
Stores ownership claims and finder verification reports.
- `_id`: `ObjectId` (Primary Key)
- `itemId`: `ObjectId` (Required reference to `items._id`)
- `claimType`: `String` (Enum: `['ownership_verification', 'found_item_report']`)
- `contactName`: `String` (Required, claimant's full name)
- `itemColor`: `String` (Color details provided to prove ownership of found items)
- `uniqueFeature`: `String` (Distinguishing marks/scratches/features)
- `lostLocation`: `String` (Where the owner originally misplaced the item)
- `foundLocation`: `String` (Where a finder found a lost item)
- `foundDate`: `String` (Date found)
- `additionalInfo`: `String` (Extra notes)
- `status`: `String` (Enum: `['Pending', 'Verified', 'Rejected']`, default: `'Pending'`)
- `user`: `ObjectId` (Optional reference to `users._id`)
- `createdAt`, `updatedAt`: `Date` (Automated timestamps)

---

## 🚀 3. REST API Specification & Query Parameters

### Base URL: `/api` (Proxied via Vite to `http://localhost:5000`)

| Method | Endpoint | Description | Query / Body Parameters |
|---|---|---|---|
| `GET` | `/api/health` | Health & connection check | None |
| `GET` | `/api/items` | Filtered item list | `type`, `category`, `location`, `status`, `search`, `sort` |
| `GET` | `/api/items/:id` | Single item details | URL param: MongoDB `_id` |
| `POST` | `/api/items` | Create lost/found item | JSON body with item schema fields |
| `POST` | `/api/claims` | Submit claim & update status | `{ itemId, contactName, itemColor, ... }` |
| `GET` | `/api/claims` | List claims (coordination) | None |

### Agreed Query Parameters for `GET /api/items`:
- `type`: `'lost'` | `'found'` | `'all'`
- `category`: Matches any supported category (e.g. `'Electronics'`)
- `location`: Matches any campus location (e.g. `'Library'`)
- `status`: `'Open'` | `'Claimed'` | `'Archived'`
- `search`: Case-insensitive regex match across title, description, category, and location
- `sort`: `'newest'` (default) | `'oldest'` | `'az'` | `'za'`

---

## 💻 4. Frontend Integration Overview (Member 3)

### Shared Axios Client: `src/services/api.js`
- Created reusable Axios client with baseURL configuration and error handling.
- Exports helper functions:
  - `getItems(params)`
  - `getItemById(id)`
  - `createClaim(claimData)`
  - `createItem(itemData)`
  - Default `api` instance.

### `src/pages/Items.jsx`
- Fetches dynamic items list from `GET /api/items`.
- Debounced search querying (250ms delay).
- Integrated loading state (`.status-container--loading` with animated spinner).
- Integrated error state (`.status-container--error` with **Retry Connection** button).
- Integrated empty states:
  - If no items match current search/filters: displays prompt and "Clear All Filters" button.
  - If registry is empty: displays polite empty inbox notification.
- Consistent usage of MongoDB `_id` in keys and card details.

### `src/components/ItemCard.jsx`
- Uses `item._id || item.id` consistently for navigation (`/item/${itemId}`).
- Cleanly displays uploaded images with fallback to category emoji icons.

### `src/pages/ItemDetails.jsx`
- Fetches item document via `GET /api/items/:id`.
- Submits claim via `POST /api/claims`.
- Displays claim success **only after backend confirms it** (`Claimed` badge and success notification).
- Loading spinner and error state with **Retry Request** button.

### Local Storage Retention: `src/utils/storage.js`
- Maintained completely intact and functional for backwards compatibility with Member 1's `ReportLost.jsx` until full team migration is finalized.

---

## 📋 5. Team Coordination & Endpoint Status

| Endpoint | Assignee | Implementation Status | Notes |
|---|---|---|---|
| `GET /api/items` | Member 3 | ✅ Completed & Verified | Tested with filtering, sorting & text search |
| `GET /api/items/:id` | Member 3 / Member 4 | ✅ Completed & Verified | Tested with MongoDB ObjectId lookup |
| `POST /api/claims` | Member 3 / Member 4 | ✅ Completed & Verified | Inserts into `claims` collection & sets item `status = 'Claimed'` |
| `POST /api/items` (Lost) | Member 1 | ⏳ Pending Frontend Migration | Backend endpoint ready; `ReportLost.jsx` can switch from `storage.js` to `api.createItem()` |
| `POST /api/items` (Found) | Member 2 | ⏳ Pending Page & API Implementation | Backend endpoint ready; `ReportFound.jsx` placeholder awaiting Member 2 form |
| Authentication / JWT | Member 4 | ⏳ Architecture Ready | `users` collection and `server/routes/userRoutes.js` scaffolded for token integration |

---

## 🛠️ 6. How to Run & Verify

1. **Start Express Server:**
   ```bash
   cd server
   node server.js
   # Or from root:
   npm run server
   ```
2. **Seed Initial Database Records:**
   ```bash
   cd server
   node seeds/seed.js
   ```
3. **Start Frontend:**
   ```bash
   npm run dev
   ```
4. **Run Verification Commands:**
   ```bash
   npm run build
   npm run lint
   ```

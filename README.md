# College Discovery & Decision-Making Platform (Full-Stack MVP)

A production-grade, highly scalable Full-Stack MVP designed to help students search, filter, compare, and bookmark educational institutions. Inspired by Careers360 and Collegedunia, the application features an authentic user experience tailored for Indian higher education metrics.

---

## 🚀 Mandatory Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS
- **State Management**: Zustand (Local Storage Persistent Cache middleware)
- **Forms & Validation**: React Hook Form + Zod
- **Backend**: Next.js API Route Handlers, Prisma ORM (v7.8)
- **Database**: PostgreSQL (Neon Server / Local DB)
- **Authentication**: NextAuth.js (Credentials & Google OAuth Provider)

---

## 🛠️ Quick Start & Setup Instructions

Follow these steps to launch the application locally.

### 1. Clone & Install Dependencies
Ensure you have [Node.js](https://nodejs.org) installed on your system.
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root and populate it with your PostgreSQL connection string and NextAuth variables:
```env
# PostgreSQL connection string (Local or Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/college_discovery?schema=public"

# NextAuth configuration
NEXTAUTH_SECRET="your-generated-nextauth-secret-key-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional for Google Login integration)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Setup the Database Schema
Push the relational schema definitions directly into your PostgreSQL database using Prisma:
```bash
npx prisma db push
```

### 4. Seed the Database
Run the TypeScript seed script to pre-populate the database with 60 diverse, realistic colleges (covering Engineering, MBA, and Medical specialties), mock student reviews, and test credentials:
```bash
npx prisma db seed
```

### 5. Run in Development
Fire up the local Next.js development server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Default Test Scholar Credentials
To explore the protected bookmarks panel immediately without completing registration, sign in using:
- **Email**: `student@college.com`
- **Password**: `password123`

---

## 🗄️ Relational Database Schema Model

The database represents a clean, indexed structure supporting cascades, unique constraints, and search optimizations.

```mermaid
erDiagram
    USER ||--o{ REVIEW : "writes"
    USER ||--o{ SAVED_COLLEGE : "bookmarks"
    COLLEGE ||--o{ REVIEW : "receives"
    COLLEGE ||--o{ SAVED_COLLEGE : "saved_by"

    USER {
        string id PK
        string name
        string email UK
        string password
        string image
        datetime createdAt
    }

    COLLEGE {
        string id PK
        string slug UK
        string name
        string description
        string location
        string state
        float fees
        float rating
        int establishedYear
        string imageUrl
        float placementAverage
        float placementHighest
        string[] courses
        string[] facilities
        datetime createdAt
    }

    REVIEW {
        string id PK
        string userId FK
        string collegeId FK
        int rating
        string comment
        datetime createdAt
    }

    SAVED_COLLEGE {
        string id PK
        string userId FK
        string collegeId FK
        datetime createdAt
    }
```

### Database Performance Enhancements
- **Optimized Indexes**: Added custom indexes in `schema.prisma` on fields heavily involved in filtering: `College(name)`, `College(state)`, `College(fees)`, and `College(rating)`.
- **Relational Integrity**: Configured compound unique keys on `SavedCollege(userId, collegeId)` to enforce bookmarks unique constraints.
- **Cascade Operations**: Set up cascading deletes (`onDelete: Cascade`) for reviews and bookmarks when parents are removed.

---

## 🧩 Architectural Decisions & Tradeoffs

### 1. Next.js 15/16 App Router & Async Params
We leverage Next.js App Router to maximize SEO through Server Components while delivering low bundle-sizes.
- **Breaking API Changes Handled**: In Next.js 15+, route parameters (`params`) in server routes and dynamic pages are resolved asynchronously as a `Promise`. We strictly treat them as async (e.g. `const { id } = await params;`) to ensure full compile-time compliance and prevent runtime warnings.
- **Prisma v7 Upgrade Compliance**: In the latest Prisma versions, database connection URLs have been moved out of `schema.prisma` and into `prisma.config.ts` to improve performance and compatibility. We conform to this by declaring schema bounds in `schema.prisma` and database configurations in `prisma.config.ts`.

### 2. Zustand Caching persistent middleware
Instead of adding heavy Redux boilerplate, we use Zustand:
- **Compare Tray persistence**: The selected colleges list is wrapped in Zustand's `persist` middleware, automatically caching chosen selections in the browser's `localStorage`. Selections survive navigation changes, detail panel clicks, and hard reloads.

### 3. Server-side Filtering vs. Client-side rendering
- **No Client Filtering**: In accordance with enterprise specifications, all list searches, state dropdowns, course streams, fees ranges, and stars checkboxes issue query payloads to `GET /api/colleges`. Paging calculations, limit offsets, and result counts are computed entirely in the database using SQL limits.

---

## 📡 API Reference Standards

All endpoints validate parameters via Zod, handle database failures gracefully, and return consistent JSON structures:

```json
{
  "success": true,
  "data": {},
  "message": "Description of query outcome"
}
```

### 1. Colleges Explore & Search
- **Endpoint**: `GET /api/colleges`
- **Query Params**: `search`, `state`, `feesMin`, `feesMax`, `rating`, `courseType`, `page`, `limit`, `sortBy`, `sortOrder`
- **Output**: Returns paginated list of colleges accompanied by pagination metadata (`totalCount`, `totalPages`, etc.).

### 2. College Detail Page
- **Endpoint**: `GET /api/colleges/[id]`
- **Output**: Retrieves detailed specs of a single college, including its reviews list and author details. Returns `404` for missing IDs.

### 3. Side-by-Side College Comparison
- **Endpoint**: `POST /api/compare`
- **Body**: `{ "collegeIds": ["id1", "id2", "id3"] }` (Accepts 2 to 3 IDs, rejects duplicates)
- **Output**: Returns comparison fields and computes the winning highlights for lowest fees, highest average, highest peak, and highest rating.

### 4. Bookmark Saved Colleges
- **Endpoints**: `GET /api/saved` (retrieves bookmarks), `POST /api/saved` (adds bookmark), `DELETE /api/saved/[id]` (removes bookmark)
- **Security**: Authenticated access only. Validates active session via NextAuth before executing database reads/writes.

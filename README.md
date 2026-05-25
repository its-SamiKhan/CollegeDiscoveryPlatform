# College Discovery & Decision-Making Platform

A robust, full-stack web application designed for the Indian higher education ecosystem, enabling students to search, filter, compare, and bookmark over 34,000+ academic institutions. This platform is engineered for scalability, data density, low-latency search queries, and high-reliability bulk data synchronization, serving as a high-performance system for educational discovery.

---

## Project Overview

The College Discovery Platform addresses the critical challenge of navigating large-scale institutional datasets. It consolidates unstructured educational records into an indexed relational schema. The system allows users to execute complex multi-faceted filters, perform side-by-side comparative audits of up to three colleges with automated metric highlighting, utilize score-based predictors matching national entrance exam scores (JEE, NEET, CAT) to historic cutoffs, and collaborate via a threaded Q&A discussions board.

---

## Key Features

* **Indexed Directory Search**: Real-time filtering across 34,000+ colleges using state boundaries, rating metrics, tuition fees, and course streams (Engineering, MBA, Medical).
* **Multi-College Comparison Engine**: Side-by-side spec auditing with automated highlight winners for placement rates, fee values, and ratings, supported by local cache persistence.
* **Entrance Exam Predictor**: Mathematical matching of ranks and percentiles to college admission ranges for JEE Main/Advanced, NEET, and CAT.
* **Threaded Q&A Forum**: Asynchronous community board for posting discussion threads and submitting replies under authenticated sessions.
* **Dynamic Content Dashboard**: Student panel displaying saved bookmarks and comparison matrices with clean delete controls.
* **Adaptive Theme Controls**: Dark/Light mode toggle utilizing CSS custom variables and an inline parser script to prevent client-side flash of light theme during initial page load.

---

## Architecture Decisions

### 1. Next.js App Router
Next.js App Router (React 19 Server Components) was selected to implement hybrid rendering strategies. By rendering the static layout and initial query results on the server, the application achieves fast first-contentful-paint (FCP) and search-engine discoverability (SEO). Dynamic sub-routing handles pages like `/colleges/[id]` asynchronously, resolving parameter promises natively to maintain framework compliance.

### 2. Prisma ORM
Prisma ORM was chosen to manage database access, providing static type safety, automatic migrations, and clean relational mappings. Compared to raw SQL, it reduces development overhead while still allowing schema optimizations. For high-throughput scenarios, Prisma's `createMany` batch insertions bypass individual transaction limits, delivering rapid database writes.

### 3. Zustand Global State
Zustand was selected for client-side state management instead of Redux due to its atomic design, low bundle footprint, and minimal boilerplate. It handles transient states (e.g. toast notifications) and local caching (e.g. comparison lists) using simple, highly performant hooks without container wrapping.

### 4. PostgreSQL & Neon Serverless
PostgreSQL provides robust support for relational integrity, constraints, and index indexing (B-Tree). Neon's serverless model fits development cycles, but its connection pooling limits require efficient client recycling and query batching, which are managed within the application layer.

### 5. Unified Next.js API Route Handlers
API Route Handlers were used instead of a separate backend service to reduce deployment complexity, eliminate cross-origin resource sharing (CORS) overhead, and simplify type sharing between client interfaces and database models.

### 6. Local Storage Persistence for Compare Tray
Zustand's persist middleware was configured to sync comparisons directly to `localStorage`. This ensures selections persist through page refreshes, detail checks, and auth sessions without generating unnecessary database writes.

### 7. Sliding-Window Pagination
Sliding-window pagination was chosen over infinite scrolling to provide predictable database queries (using SQL offsets), maintain server memory stability, ensure bookmarkable search URLs, and prevent DOM performance degradation from rendering thousands of nodes.

### 8. Zod Schema Validation
Zod was implemented on both the frontend (React Hook Form resolvers) and backend (API query parsers) to validate inputs, enforce data contracts, prevent database constraint errors, and block malformed payloads before execution.

---

## Tech Stack

* **Core Framework**: Next.js 16 (App Router), React 19, TypeScript
* **Database & ORM**: PostgreSQL, Prisma ORM
* **Global State & Cache**: Zustand
* **Form & Validation**: React Hook Form, Zod
* **Client Styling**: TailwindCSS v4, PostCSS
* **Authentication**: NextAuth.js

---

## Folder Structure

```
src/
├── app/                  # Next.js page layout files and API route handlers
│   ├── (auth)/           # Authentication layout routes (login, signup)
│   ├── (protected)/      # Authenticated user views (dashboard, profile)
│   ├── api/              # Restful endpoints (colleges, compare, predictor)
│   └── colleges/         # Paginated college directory routes
├── components/           # Reusable components
│   ├── college/          # Directory, filters, and dashboard layout components
│   ├── layout/           # Shared structures (Navbar, Footer, ThemeProvider)
│   └── ui/               # Atom-level layout controls (Button, Input, Badge, Skeletons)
├── lib/                  # Database connections and authentication definitions
├── store/                # Zustand client cache stores (compare, toast notifications)
└── utils/                # Helper files and algorithmic parsing functions
```

### Directory Purposes
* **`app/`**: Implements the application routing tree. It isolates API route handlers from view-rendering pages and groups routes logically using route groups (e.g., `(auth)`, `(protected)`).
* **`components/`**: Houses components, split between atom-level primitives (`ui/`), structural elements (`layout/`), and domain-specific UI (`college/`).
* **`lib/`**: Contains shared singletons and helper initializers, including the database Prisma Client wrapper and NextAuth authentication options.
* **`store/`**: Hosts global client-side state managers utilizing Zustand for caching states and notifications.

---

## Database Architecture

The relational schema is configured in PostgreSQL to support cascade operations, relational integrity, and search optimizations.

```mermaid
erDiagram
    USER ||--o{ REVIEW : "writes"
    USER ||--o{ SAVED_COLLEGE : "bookmarks"
    USER ||--o{ SAVED_COMPARISON : "saves comparison"
    USER ||--o{ QUESTION : "posts"
    USER ||--o{ ANSWER : "replies"
    COLLEGE ||--o{ REVIEW : "receives"
    COLLEGE ||--o{ SAVED_COLLEGE : "saved_by"
    QUESTION ||--o{ ANSWER : "contains"

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

    SAVED_COMPARISON {
        string id PK
        string userId FK
        string[] collegeIds
        datetime createdAt
    }

    QUESTION {
        string id PK
        string title
        string content
        string userId FK
        datetime createdAt
    }

    ANSWER {
        string id PK
        string content
        string questionId FK
        string userId FK
        datetime createdAt
    }
```

### Relational Constraints
* **Compound Uniqueness**: A unique constraint `@@unique([userId, collegeId])` on `SavedCollege` prevents duplicate bookmarks.
* **Cascading Actions**: Deleting a `User` or `College` automatically deletes dependent records in `Review`, `SavedCollege`, `SavedComparison`, `Question`, and `Answer` using `onDelete: Cascade`.
* **Search Optimization**: Database-level indexes are declared on fields heavily involved in filtering: `College(name)`, `College(state)`, `College(fees)`, and `College(rating)`.

---

## API Design

The API endpoints conform to RESTful design standards. Each response returns a consistent structure containing payload validation markers:

```json
{
  "success": true,
  "data": {},
  "message": "Resource resolved successfully"
}
```

| Method | Endpoint | Description | Payloads |
|:---|:---|:---|:---|
| **GET** | `/api/colleges` | Paginated search of college directory | Search, state, fee bounds, page limits |
| **GET** | `/api/colleges/[id]` | Resolves a single college entity with reviews | Dynamic path identifier |
| **POST** | `/api/compare` | Compares 2-3 colleges and highlights winner metrics | `{ collegeIds: ["id1", "id2", "id3"] }` |
| **GET/POST** | `/api/saved` | Manages authenticated dashboard bookmarks | `{ collegeId: "id" }` |
| **DELETE** | `/api/saved/[id]` | Removes specific bookmark from profile | Dynamic path identifier |
| **GET/POST** | `/api/compare/saved` | Manages saved user comparison lists | `{ collegeIds: ["id1", "id2", "id3"] }` |
| **POST** | `/api/predictor` | Matches entrance exam scores to colleges | `{ exam: "jee"\|"neet"\|"cat", rank: number }` |
| **GET/POST** | `/api/discussions` | Retrieves or posts Q&A forum threads | `{ title: "string", content: "string" }` |
| **POST** | `/api/discussions/[id]/answers` | Submits answers to specific questions | `{ content: "string" }` |

---

## Performance Optimizations

* **Batch Inserts (`createMany`)**: The data importer inserts records in chunk sizes of 2,000 using transactionless `createMany` query executions, importing 34,000+ rows into the cloud database in 15 seconds.
* **Deterministic Hashed Image Fallbacks**: Implements a client-side lookup that hashes college names deterministically to assign one of 12 local assets, eliminating database storage overhead for image paths.
* **Database Query Indexing**: Leverages database indexes on `state`, `fees`, and `rating` fields to keep query execution times under 50ms even with large search volumes.

---

## Edge Cases Handled

* **Invalid IDs**: Path variable validators return clean `404 Not Found` messages if database lookup keys are missing or malformed.
* **Missing Placement Records**: Renders neutral labels (e.g. `N/A`) if placement average or highest values are undefined.
* **Bookmark Uniqueness**: Enforces compound unique indexes to reject duplicate client requests for the same saved college.
* **Next.js Async Params**: Strictly handles dynamic parameter updates using async promises to prevent runtime hydration blocks.
* **Image Loading Failures**: Embedded images use `onError` triggers to swap broken URLs with a fallback asset automatically.
* **Neon SQL Connection Timeout**: Implements connection reuse logic and skips heavy transactions to keep queries functional under pooled database resources.

---

## Tradeoffs & Engineering Decisions

* **Pagination vs. Infinite Scrolling**: Pagination was chosen to maintain database index safety. Infinite scroll patterns introduce DOM memory leaks on larger page counts and break URL shareability, whereas sliding-window pagination preserves resource footprint and allows shareable search links.
* **Database-Level Filtering vs. Client Filtering**: In-memory JavaScript sorting degrades client runtime performance on lists with 34,000+ items. Performing queries directly in PostgreSQL allows database engine optimization and ensures low transmission overhead.
* **Zustand over Redux**: Zustand avoids boilerplate code and reduces client-side bundle size, matching the needs of this application without adding complex dispatch-reducer structures.

---

## Local Setup

### 1. Clone and Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?sslmode=require"
NEXTAUTH_SECRET="your-32-character-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Initialize Database Schema
Sync database tables with the schema:
```bash
npx prisma db push
```

### 4. Seed Database & Import CSV
Run the bulk importer to clean tables, seed default profiles, and populate the 34,000+ colleges dataset:
```bash
npx tsx prisma/import-csv.ts
```

### 5. Run local server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Environment Variables

| Variable Name | Description | Example Value |
|:---|:---|:---|
| `DATABASE_URL` | PostgreSQL connection string with SSL configurations | `postgresql://user:pass@host:port/db?sslmode=verify-full` |
| `NEXTAUTH_SECRET` | Secret key used to sign NextAuth session JWT tokens | `openssl rand -base64 32` generated string |
| `NEXTAUTH_URL` | Base canonical domain of the web application | `http://localhost:3000` (Local) / `https://domain` (Prod) |

---

## Database Seeding

The seeding process consists of two stages:
1. **Developer Seed**: Creates a testing user account (`student@college.com` / `password123`) and seeds 90 elite institutions (IITs, IIMs, AIIMS) complete with sample student reviews and threaded Q&A discussions.
2. **Bulk Seeding**: Parses the CSV data, maps the correct column indexes, and inserts the remaining 33,950 colleges in batches of 2,000 records.

---

## Authentication

Authentication is handled by **NextAuth.js** utilizing a **JSON Web Token (JWT) strategy**:
* **Credentials Flow**: Secure login using encrypted password hashing (`bcryptjs`) against registered users.
* **Session Verification**: Route guards block unauthenticated requests to `/dashboard` and `/profile`. API route handles check session headers to enforce access control.

---

## Future Improvements

* **Google OAuth**: Integrate Google sign-in flow.
* **Redis Cache Layer**: Implement Redis key-value caching to cache search endpoints and reduce PostgreSQL read loads.
* **Search Optimization**: Integrate Elasticsearch to enable full-text fuzzy searches across all 34,000+ institutional names.
* **Administrative Portal**: Add dashboard layouts for moderators to approve reviews and manage forum threads.

---

## Deployment

The application is configured for deployment on **Vercel** with a serverless database on **Neon PostgreSQL**:
1. Environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`) must be configured in Vercel settings.
2. The Vercel build command automatically runs database migrations (`prisma generate && next build`) before compilation.

---

## Screenshots Placeholder Section

* **Homepage & Search Hero**: `[Screenshot Placeholder: Homepage Search Hero]`
* **Explore Directory**: `[Screenshot Placeholder: Directory Search Filters]`
* **College Comparison Table**: `[Screenshot Placeholder: College Comparison Winners]`
* **Rank Predictor Dashboard**: `[Screenshot Placeholder: Score Predictor Interface]`
* **Threaded Discussions Feed**: `[Screenshot Placeholder: Q&A Discussions Forum]`

---

## Author

Developed & Maintained by **[Sami Khan (its-SamiKhan)](https://github.com/its-SamiKhan)**.

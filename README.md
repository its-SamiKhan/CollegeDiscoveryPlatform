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

## Dataset & Data Ingestion Pipeline

### 1. The Dataset
The application utilizes a comprehensive Indian educational dataset consisting of **34,000+ unique college profiles** sourced from the University Grants Commission (UGC) and All India Survey on Higher Education (AISHE) public records.

### 2. Implementation Details
Data parsing and database seeding are managed dynamically by the ingestion script ([import-csv.ts](file:///Users/sam/Projects/College%20Discovery%20Platform%28Full-Stack%29/prisma/import-csv.ts)):
* **Regex-Based CSV Parser**: Parses raw CSV rows using advanced regular expressions (`/,(?=(?:(?:[^"]*"){2})*[^"]*$)/`) to handle complex quotes and comma boundaries inside names.
* **Schema Offset Realignment**: Corrects index mappings to extract accurate attributes: `columns[7]` for College Name, `columns[11]` for State, `columns[12]` for City/District, and `columns[3]` for established year.
* **Stream Classification Classifier**: Analyzes names to classify colleges into `engineering`, `mba`, or `medical` streams. If name heuristics are neutral, a proportional modulo distribution is used.
* **Transactionless Bulk Insertion**: Splits the records into batches of 2,000, using Prisma's `createMany` query to bypass Neon PostgreSQL connection and transaction limitations. This imports all 34,000+ colleges in under 15 seconds.

### 3. Dataset Compatibility Matrix
To optimize system performance and feature relevance, the database runs two parallel datasets. The bulk UGC/AISHE CSV data contains raw organizational specs without historical entrance exam cutoff ranges; thus, the Rank Predictor tool is designed to query the pre-configured Elite Seeded dataset.

| Feature / Functionality | 🎓 Elite Seeded Dataset (90 Colleges) | 📊 UGC / AISHE Bulk Dataset (33,950 Colleges) |
| :--- | :---: | :---: |
| **Paginated Search Directory** | ✅ Supported | ✅ Supported |
| **Multi-faceted Filtering** (Fees, State, Rating) | ✅ Supported | ✅ Supported |
| **Side-by-Side Comparison Engine** | ✅ Supported | ✅ Supported |
| **Detailed Specs & Facility Views** | ✅ Supported | ✅ Supported |
| **Bookmarks & Saved Comparisons** | ✅ Supported | ✅ Supported |
| **Q&A Discussions Forum** | ✅ Supported (Pre-seeded Threads) | ✅ Supported (User-Submitted Threads) |
| **Rank/Score Predictor Tool** | ✅ Supported (Pre-configured Cutoffs) | ❌ Unsupported (No exam cutoff metadata) |

---

## Authentication

Authentication is handled by **NextAuth.js** utilizing a **JSON Web Token (JWT) strategy**:
* **Credentials Flow**: Secure login using encrypted password hashing (`bcryptjs`) against registered users.
* **Session Verification**: Route guards block unauthenticated requests to `/dashboard` and `/profile`. API route handles check session headers to enforce access control.

---

## Testing & Verification

The platform has been audited using static analysis and manual verification checks:

### 1. Static Type Checking & Builds
* **TypeScript Compiler Check**: Run `npx tsc --noEmit` locally to ensure type safety.
* **Next.js Production Build**: Run `npm run build` to verify route configuration, dynamic route generation parameters, and CSS compilation.

### 2. Manual End-to-End Auditing
* **Responsive Layout Check**: Layouts tested across mobile, tablet, and desktop viewports, using collapsible sidebar layouts and drawer overlays.
* **Pagination Boundary Checks**: Verification of page numbers, query limits, and search inputs on the explore directory.
* **Authentication Guards**: Verified that guest users are redirected to login when trying to access `/dashboard`, `/profile`, write reviews, or submit Q&As.

### 3. API & Database Testing
* **Integration Testing**: Checked JSON responses for API routes (GET `/api/colleges`, POST `/api/compare`, POST `/api/predictor`) under simulated guest and student sessions.
* **Mock Testing Credentials**: Pre-seeded default scholar profile (`student@college.com` / `password123`) to verify dashboard actions, bookmark saves, and comparative lists.

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

## Author

Developed & Maintained by **[Sami Khan](https://github.com/its-SamiKhan)**.

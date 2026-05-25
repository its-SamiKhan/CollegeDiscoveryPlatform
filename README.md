# 🎓 College Discovery & Decision-Making Platform (Full-Stack MVP)

A production-grade, highly scalable, and visually stunning Full-Stack College Discovery & Decision-Making Platform designed for the Indian educational ecosystem. Built with a modern, high-contrast, above-the-fold aesthetic, the application enables students to explore over **34,000+ colleges** (seeded from UGC/AISHE datasets), perform dynamic side-by-side comparisons, run rank predictions based on national exams, bookmark colleges, and participate in a threaded student discussion forum.

Developed & Maintained by **[Sami Khan](https://github.com/its-SamiKhan)**.

---

## ✨ Primary Platform Features

### 🔍 1. Intelligent Explore & Search Directory
* **Large-Scale Dataset**: Over **34,000+ colleges** parsed, filtered, and loaded into Postgres, coexisting with 90 elite seeded universities (IITs, IIMs, AIIMS).
* **Multi-Dimensional Filters**: Live filtering by state, annual fees (range slider/inputs), minimum rating (stars rating filters), and course streams (Engineering, MBA, Medical).
* **Dynamic Sliding Pagination**: Uses a smart 5-button sliding window (e.g., `[1] 2 3 4 5` or `43 44 [45] 46 47`) and Next/Prev controls, avoiding horizontal scroll stretch and loading pages instantly via database-level offsets.
* **Smart Image Hashing**: Prevents broken images by dynamically hashing college names to resolve one of 12 premium high-resolution campus photos, with a client-side `onError` fallback wrapper.

### ⚔️ 2. Dynamic College Comparison Engine
* **Side-by-Side Analysis**: Compare 2 or 3 colleges across multiple specs, including established year, location, average fees, student rating, facilities, and placements.
* **Winner Highlights**: Automatically analyzes and highlights the winning values (e.g., lowest fees, highest package, highest average package, top student rating) in vibrant green.
* **Compare Tray Persistence**: Utilizes a persistent Zustand store cached in `localStorage` that persists through reloads, directory browsing, and page navigation.
* **Save Comparisons**: Allows authenticated students to save their comparison lists to their personal dashboard.

### 🎓 3. Rank Predictor Tool
* **National Entrance Exams**: Supported filters for **JEE Main/Advanced** (Engineering), **NEET** (Medical), and **CAT** (MBA).
* **Score-to-College Recommendations**: Computes matching colleges by evaluating student scores, percentiles, and ranks against historical college admission thresholds.

### 💬 4. Interactive Student Discussion Forum
* **Threaded Q&A Boards**: Students can read threads, view answers, submit new questions, and answer peer questions in real-time.
* **Live Status Markers**: Modern cards featuring pulsating neon status indicators showing active discussions.

### 👤 5. Dual-Tab Student Dashboard
* **Saved Colleges (Bookmarks)**: High-design grid layout of bookmarked colleges with clean hover overlays to easily remove bookmarks.
* **Saved Comparisons**: Lists saved side-by-side comparisons with clean layout columns, custom "VS" badges, redirect links to view comparisons, and simple trash removal.

### 🎨 6. Premium Visual Aesthetics & Theme Engine
* **Symmetric Above-the-Fold Layout**: Hero section with condensed spacing (`pt-16 pb-12`), proportional typography (`text-2xl` to `text-5xl`), and a modern flat double-bordered search bar to eliminate browser rendering shadows.
* **Drifting Gradient Typography**: Eye-catching background gradients that dynamically animate across character spans.
* **Symmetric Grid Footer**: Visually balanced 12-column subgrid layout displaying social media links, shortcuts, and page details.
* **Zero-Flash Theme Toggle**: Cached dark/light modes with synchronous `<head>` script parsing, ensuring a seamless dark/light mode shift without visual flashes during page loads.

---

## 🚀 Technical Stack

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript
* **Styling (CSS)**: TailwindCSS v4 with custom utility declarations and HSL color palettes
* **State Management**: Zustand with persistent storage middleware
* **Forms & Validation**: React Hook Form + Zod
* **Backend**: Next.js API Route Handlers
* **Database & ORM**: PostgreSQL (Neon Serverless) + Prisma ORM (v7.8)
* **Authentication**: NextAuth.js (Credentials & Google OAuth Provider)

---

## 🗄️ Relational Database Architecture

The database is built on PostgreSQL with strict referential integrity, cascading deletes, unique indexes, and search indexing optimizations.

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

### Performance & Schema Enhancements
* **Database Indexes**: Custom indexing is configured in `schema.prisma` on high-traffic fields: `College(name)`, `College(state)`, `College(fees)`, and `College(rating)` to optimize search queries.
* **Compound Unique Keys**: Added compound uniqueness constraints on `SavedCollege(userId, collegeId)` to prevent duplicate bookmarks.
* **Cascading Operations**: Configured `onDelete: Cascade` on foreign relations to cleanly remove child records (Reviews, Bookmarks, Q&As) if their parent User or College is deleted.

---

## ⚡ High-Performance Importer & Seed

Free-tier serverless databases (like Neon PostgreSQL) impose active transaction limits and connection timeouts. To bypass these limitations:
1. **Transactionless Insertion**: Replaced heavy nested transaction loops with Prisma's `createMany()` method.
2. **Chunking**: Processes and bulk-inserts the **34,000+ CSV records** in optimized batches of **2,000** records.
3. **UUID Generation**: Uses Node.js's native `crypto.randomUUID()` to generate primary keys client-side, enabling fast inserts while avoiding duplicate constraint collisions.
4. **Column Mapping Alignment**: Successfully parses row data by aligning index pointers with the CSV: `columns[7]` for Name, `columns[11]` for State, `columns[12]` for City/District, and `columns[3]` for established year.

*Result: Seeds the 90 Elite Colleges, users, and discussions, and imports all 34,000+ CSV records into the cloud database in under 15 seconds.*

---

## 🛠️ Local Setup & Quick Start

Follow these steps to configure and run the project in your local development environment:

### 1. Clone & Install Dependencies
Ensure you have [Node.js](https://nodejs.org) (v18+) installed.
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and configure the database link and NextAuth secret keys:
```env
# Database connection string (Local PostgreSQL or Neon Cloud)
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?sslmode=require"

# NextAuth secrets (Generate via: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-nextauth-secret-key-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# (Optional) Google OAuth Keys for Google Login
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Setup Database Schema
Push the Prisma schemas and sync your PostgreSQL database tables:
```bash
npx prisma db push
```

### 4. Seed and Import Datasets
Run the high-performance bulk importer to clean the database, seed the core universities, forum threads, and load the 34,000+ colleges dataset:
```bash
npx tsx prisma/import-csv.ts
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your web browser.

---

## 🧪 Credentials for Immediate Access

To test authenticated panels (Dashboard, Saved Comparisons, Review Submissions, Forum Q&As) without registering a new email, sign in with:
* **Email**: `student@college.com`
* **Password**: `password123`

---

## 📡 API Reference Standards

All backend API handlers are located under `src/app/api/` and utilize Zod schemas to validate queries/payloads, returning standardized response formats:

| Method | Endpoint | Description | Query / Body Parameters |
|:---|:---|:---|:---|
| **GET** | `/api/colleges` | Searches and retrieves a paginated list of colleges | `search`, `state`, `feesMin`, `feesMax`, `rating`, `courseType`, `page`, `limit`, `sortBy`, `sortOrder` |
| **GET** | `/api/colleges/[id]` | Retrieves detailed attributes of a single college | Unresolved dynamic route `id` parameter |
| **POST** | `/api/compare` | Compares 2-3 colleges and flags metric winners | `{ collegeIds: ["id1", "id2", "id3"] }` |
| **GET** | `/api/saved` | Retrieves all college bookmarks for the logged-in student | Authenticated session header |
| **POST** | `/api/saved` | Bookmarks a new college to the student's dashboard | `{ collegeId: "id" }` |
| **DELETE**| `/api/saved/[id]` | Removes a bookmarked college from the student's dashboard | Dynamic college `id` parameter |
| **GET** | `/api/compare/saved` | Retrieves all saved compared lists for the user | Authenticated session header |
| **POST** | `/api/compare/saved` | Saves a compared colleges list to the student's dashboard | `{ collegeIds: ["id1", "id2", "id3"] }` |
| **DELETE**| `/api/compare/saved/[id]`| Deletes a saved comparison set from the dashboard | Dynamic comparison set `id` parameter |
| **POST** | `/api/predictor` | Recommends matching colleges based on exam credentials | `{ exam: "jee" \| "neet" \| "cat", rank: number, score: number }` |
| **GET** | `/api/discussions` | Retrieves discussions and questions from the Q&A forum | Optional search query |
| **POST** | `/api/discussions` | Posts a new student question thread | `{ title: "string", content: "string" }` |
| **POST** | `/api/discussions/[id]/answers`| Submits a reply/answer to a discussion thread | `{ content: "string" }` |

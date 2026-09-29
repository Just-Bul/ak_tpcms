# Training and Placement Cell Management System (TPCMS)

A full-stack, enterprise-grade web application for managing campus recruitment, internship drives, student placement tracking, and corporate engagements.

---

## 1. System Overview & Architecture

TPCMS is built with a decoupled architecture:
* **Backend**: Node.js, Express, TypeScript, Prisma ORM, MySQL database, Zod validation, JWT authentication, Multer file uploads.
* **Frontend**: React, Vite, Tailwind CSS v4, Lucide Icons, Axios.

```
Internship-Full/
├── backend/                        # Express + TypeScript + Prisma API Server
│   ├── prisma/schema.prisma        # Database models & relations
│   ├── src/
│   │   ├── modules/                # Domain-driven feature modules
│   │   │   ├── student/            # Student profiles, documents & alumni management
│   │   │   ├── placement/          # Placement drives & eligibility checks
│   │   │   ├── placement_application/ # Placement submissions & T&P verification
│   │   │   ├── training/           # Training programs & eligibility checks
│   │   │   ├── training_application/  # Training submissions & verification
│   │   │   ├── notification/       # Drive broadcasts & candidate eligibility feed
│   │   │   ├── organization/       # Company profiles & approvals
│   │   │   ├── department/         # Department & coordinator mappings
│   │   │   └── ...
│   │   ├── middlewares/            # Auth, validation, rate limiter, error handling
│   │   └── config/                 # Multer storage, Prisma client, environment
│   └── api_documentation.md        # Comprehensive backend REST API contracts
├── frontend/                       # React + Vite + Tailwind CSS Single-Page App
│   ├── src/
│   │   ├── pages/                  # Role-based dashboards & shared views
│   │   ├── components/             # Reusable UI cards, tables, modals & inputs
│   │   ├── hooks/                  # Auth, pagination, master-data & debounce hooks
│   │   └── services/               # Modular API services
├── FRONTEND_INTEGRATION_GUIDE.md   # Step-by-step developer guide for frontend integration
└── REFACTOR_REPORT.md              # Technical report on frontend architecture consolidation
```

---

## 2. Role-Based Access Control (RBAC)

The system supports four distinct user roles:

| Role ID | Role Name | Scope & Permissions |
| :---: | :--- | :--- |
| **1** | `SuperAdmin` | Full university-wide administrative privileges; approves companies, verifies applications, manages departments and coordinators. |
| **2** | `Student` | Browses all active placements/trainings; uploads grade cards & credentials; applies to eligible opportunities; tracks application statuses. |
| **3** | `Coordinator` | Department-level T&P officer; manages students in their branch; reviews student documents; verifies and approves applications. |
| **4** | `Organization` | Corporate recruiter; posts placement & internship opportunities; views candidate profiles for their posted drives (cannot approve/reject). |

---

## 3. Core System Highlights

### A. Open Opportunity Browsing with Protected Application
* All students can browse and view the full details (job description, salary/stipend, dates, eligibility criteria) of all placement drives and training programs, regardless of whether they meet the criteria.
* When submitting an application, the backend strictly evaluates candidate eligibility (CGPA, active backlogs, 10th & 12th division, department, semester, and deadline). Ineligible submissions are rejected with a descriptive HTTP 400 error.

### B. Broadcast Notification System
* `GET /notifications` delivers all announcements to every student.
* Every notice is pre-computed with the student's eligibility status (`is_eligible`, `eligibility_reason`, `can_apply`).

### C. Student Document Repository & Grade Card Review
* Students upload official documents (grade cards, marksheets, certificates, ID proofs) to `student_document_table`.
* Uploading a grade card automatically links `student_table.grade_card_url`.
* T&P Cell coordinators review attached credentials and verify them directly before approving applications.

### D. T&P Cell Exclusive Verification Authority
* Recruiter organizations (`Role.Organization`) **cannot** approve or reject student applications.
* Only the T&P Cell (`SuperAdmin` and `Coordinator`) can approve/reject candidates.
* All approvals record an immutable audit trail (`verified_by`, `verified_at`).

### E. Student Status & Alumni Management
* **Regular**: Current enrolled students (`graduation = false`, `is_graduate = false`).
* **Alumni**: Graduated students (`graduation = true`, `is_graduate = true`) with passing year, company, and designation tracked in `alumni_table`.
* Filter students dynamically by CGPA grade, status (regular/alumni), branch, semester, graduation year, and search keywords.

---

## 4. Quick Start & Setup

### Prerequisites
* Node.js (v18+)
* MySQL Server (e.g. XAMPP or standalone MySQL running on `localhost:3306`)

### 1. Database Setup
Create database `t_and_p`:
```sql
CREATE DATABASE t_and_p;
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push # Or run migrations
npm run dev        # Starts TypeScript dev server
npm run build      # Compiles TypeScript into dist/
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev        # Starts Vite dev server (usually http://localhost:5173)
```

---

## 5. Documentation Directory

* **[FRONTEND_INTEGRATION_GUIDE.md](file:///D:/Project%20Files/Program%20Projects/Node/Internship-Full/FRONTEND_INTEGRATION_GUIDE.md)**: Frontend developer guide detailing student filtering, clickable dashboard counters, notification feeds, document repository, and verification workflows.
* **[backend/api_documentation.md](file:///D:/Project%20Files/Program%20Projects/Node/Internship-Full/backend/api_documentation.md)**: Complete backend REST API handover specification, endpoints, Zod schemas, and JWT payloads.
* **[REFACTOR_REPORT.md](file:///D:/Project%20Files/Program%20Projects/Node/Internship-Full/REFACTOR_REPORT.md)**: Architectural report detailing frontend component consolidation.

# TPCMS - Training & Placement Cell Management System

TPCMS is a full-stack placement and training management application for colleges and training and placement cells. It helps students view opportunities, submit applications, upload documents, and track their status while giving coordinators, super admins, and recruiting organizations a structured workflow to manage placement drives, internship programs, and verification processes.

This repository contains the backend API, frontend application, database schema, and supporting documentation for the system.

---

## Overview

The system is split into two main parts:

- Backend: Node.js, Express, TypeScript, Prisma ORM, and MySQL
- Frontend: React + Vite with a role-based dashboard UI

The application is designed around a training and placement office workflow:

1. Students create their profile and add academic details.
2. Students browse available placement and training opportunities.
3. The system checks eligibility before submission.
4. Coordinators and super admins verify documents and applications.
5. Recruiters can post opportunities and review approved candidate data.
6. A central notification and dashboard layer keeps all roles informed.

---

## How the project works

### 1. User roles and flow

The application supports four major user roles:

- Student
  - Registers and updates personal, academic, and document information
  - Uploads resume, grade cards, and supporting documents
  - Views available placements and internships
  - Applies only if eligible
  - Tracks the application status

- Coordinator
  - Reviews student profiles and documents
  - Verifies student applications
  - Manages department-specific academic data and application decisions

- Super Admin
  - Controls overall platform operations
  - Manages departments, coordinators, verification, and governance
  - Reviews and approves major system-level actions

- Organization / Recruiter
  - Creates placement or training opportunities
  - Publishes job or internship details
  - Reviews candidate information relevant to those opportunities
  - Cannot directly approve or reject students in the T&P workflow

### 2. Placement and training lifecycle

The project models two core workflows:

- Placement drives
  - Companies or admins create placement postings
  - Criteria such as CGPA, division, backlog status, semester, and department are checked
  - Students apply to eligible openings
  - T&P staff decide whether to accept or reject the application

- Training programs
  - Similar to placement drives, but focused on training opportunities
  - Students apply to programs based on eligibility rules
  - Coordinators review and approve or reject applications

### 3. Eligibility enforcement

A key part of the project is that the backend validates applications before accepting them. This prevents invalid submissions and ensures that placements and training programs stay aligned with policy.

Examples of checks include:

- CGPA threshold
- Backlog restrictions
- Minimum tenth/twelfth division
- Department or semester eligibility
- Submission deadline
- Active/inactive status of opportunity

When a student is ineligible, the system returns a clear error explaining why the application cannot be submitted.

### 4. Document and profile management

Students can maintain:

- Academic information
- Resume and grade card uploads
- Department and semester data
- Skills and profile metadata
- Active or alumni status

The backend stores uploaded media under the public/upload handling structure, and the database links those files to student records.

### 5. Notifications and dashboards

The dashboard layer aggregates:

- student activity and application status
- placement/training opportunities
- notification feeds
- verification and approval tasks

Notifications are dynamically calculated so students can see whether they are eligible and whether they can apply for a given notice.

---

## Architecture

```text
TPCMS/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── api_documentation.md
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── FRONTEND_INTEGRATION_GUIDE.md
├── REFACTOR_REPORT.md
├── run-tpcms.bat
├── README.md
└── .env.example or project environment files (if configured locally)
```

### Backend

The backend uses:

- Express.js for API routing
- TypeScript for strong typing and maintainable services
- Prisma ORM for database access
- MySQL for persistent storage
- JWT-based auth and access control
- Zod for validation
- Multer support for file upload handling
- Rate limiting and error middleware

### Frontend

The frontend uses:

- React for reusable UI components
- Vite as the development/build tool
- React Router for protected route navigation
- Tailwind-based styling and UI components
- Dashboard views for role-based workflows

---

## Project setup

### Prerequisites

- Node.js 18 or later
- MySQL Server running locally or in a remote environment
- npm

### 1. Database setup

Create the database used by the app:

```sql
CREATE DATABASE t_and_p;
```

Then configure your environment variables in the backend project using a `.env` file. An example pattern is:

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/t_and_p"
PORT=5000
JWT_SECRET=your_super_secret_key
```

### 2. Install backend dependencies

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
npm run dev
```

The frontend usually runs on a Vite local port such as:

- http://localhost:5173

The backend usually runs on:

- http://localhost:5000

### 4. Run both apps together

A convenience script is also included at the project root:

```bat
run-tpcms.bat
```

This starts the backend and frontend in separate terminals.

---

## Main documentation

- [backend/api_documentation.md](backend/api_documentation.md) — API contracts and backend behavior
- [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) — frontend integration and workflow notes
- [REFACTOR_REPORT.md](REFACTOR_REPORT.md) — refactoring and architectural changes

---

## License and copyright

This repository does not currently include a public software license file such as MIT, Apache 2.0, or GPL. Because of that, the source code should be treated as copyrighted material unless the authors explicitly add a separate license.

Copyright (c) 2026

- [Syed Akhter Hussain](https://github.com/Ak7865)
- [Abhishek Mazumder](https://github.com/leo-v16)
- [Partha Pratim Kalita](https://github.com/ParthaPKalita)
- [Ayesha G Choudhury](https://github.com/ashgcore)

All rights reserved.

No part of this code may be copied, modified, distributed, reused, or republished without explicit written permission from the copyright holders listed above.

This README is intended for project documentation and attribution. If you want to use or extend the code in a production, educational, or commercial context, permission should be confirmed directly from the repository owners.

This project is protected by copyright law and is not currently distributed under an open-source license. The code remains the exclusive property of the copyright holders unless a separate license agreement is explicitly added by them.

---

## Summary

This project is a practical campus and training placement management system that brings together student records, eligibility checks, role-based authorization, document verification, recruiter posting workflows, and dashboard-based reporting in one application. It is designed to support the complete lifecycle of campus recruitment and internship coordination.

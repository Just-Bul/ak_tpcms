# TPCMS Frontend Refactor — Final Report

Scope: frontend only (`frontend/`), React + Vite + Tailwind v4. No backend code, database
schema, API endpoints, request/response formats, or business logic were changed at any point.
`backend/` gained only two new *documentation* files (`openapi.yaml`/`swagger.json`,
`DATABASE_RECOMMENDATIONS.md`) and this report at the repo root — no source files there were
touched.

`frontend/` already had its own git repository with real history before this work started, so
every phase below is a normal, revertible set of commits (left for you to commit — none were
made automatically per your instruction).

---

## 1. Architecture — before → after

**Before:** ~75 page files under `src/pages/{superadmin,admin,company,student}/view/*`, almost
entirely independent per-role implementations of the same features (Students, Companies,
Departments, Placements, Trainings, Applications, Notices), each hand-rolling its own table,
search, pagination-less list, and modal-free "separate page per action" navigation
(`AddStudents.jsx`, `EditStudent.jsx`, `DisableStudents.jsx`, `ViewStudents.jsx` ×2 more per
role, etc). No shared data-table, modal, or form-field primitives existed; `components/ui` had
7 basic pieces (Button, Card, Badge, Avatar, Input, StatCard, Textarea, Switch) and `hooks/` had
3 (idle-logout, sidebar state, theme).

**After:** 43 page files remain under the four role folders (`superadmin`/`coordinator`
[renamed from the confusingly-named `admin`]/`company`/`student`), the rest consolidated into
**11 shared pages** under `src/pages/shared/` that render role-appropriate actions from one
source, plus a real `components/common/`, `components/modals/`, `components/cards/`,
`components/forms/`, and `components/resume/` layer, a `hooks/` layer with 7 new reusable
hooks, and a `services/` layer with per-entity API modules replacing scattered inline
`api.get(...)` calls.

```
Before                                    After
─────────────────────────────────────    ─────────────────────────────────────
pages/superadmin/view/ViewStudents.jsx    pages/shared/StudentsPage.jsx
pages/admin/view/ViewStudents.jsx         (role-aware actions via useRolePermission)
pages/admin/view/StudentDetails.jsx       + components/modals/{StudentModal,
pages/superadmin/view/AddStudents.jsx       StudentDetailModal, DisableModal,
pages/superadmin/view/EditStudent.jsx       BulkAddStudentsModal}
pages/superadmin/view/DisableStudents.jsx
```
(and the equivalent ×6 more for Companies, Departments, Placements, Trainings, Applications,
Notices — see §3 for the full before/after file map.)

---

## 2. New reusable layer

**Hooks** (`src/hooks/`): `useAuth` (single source of truth for the logged-in user, replacing
ad hoc `localStorage.getItem('auth_user')` parsing duplicated in 8+ files), `useFetchList`
(generic list-fetch with loading/error/refetch), `usePagination`, `useDebounce`, `useModal`,
`useMasterData` (cached, deduped fetch of departments/divisions/genders/semesters/categories/
skills — previously refetched ad hoc with copy-pasted `mapById`/`findIdByLabel` helpers in 8+
files), `useRolePermission`.

**Shared UI/common components** (`src/components/ui/` + `src/components/common/`): `DataTable`
(with optional bulk-selection support), `Modal`, `SearchBar` (auto-trims — item 31), `Select`,
`SkillsInput` (comma-separated → chips — item 18), `Pagination`, `EmptyState`, `ConfirmDialog`,
`StatusBadge`, `Breadcrumb`, `DetailCard`, `Loading`, `ImageCropper` (canvas-based, no external
dependency — item 17), `AvatarUpload` (single avatar + small edit icon, wraps the cropper —
item 16).

**Cards** (`src/components/cards/`): `PlacementCard`, `TrainingCard` — modern redesigns (item
25) with applicant count (item 12), used by the browse/list pages. (Students/Companies/
Departments stay as dense sortable tables per your explicit decision — see the "card vs table"
note in §7.)

**Forms** (`src/components/forms/`): `CompanyForm` — one component covering both first-login
setup and later editing (a `disabled`/mode flag), replacing the duplicated field set previously
hand-built separately in `CompanyProfileSetup.jsx` and `CompanyProfile.jsx`.

**Modals** (`src/components/modals/`): `StudentModal`, `StudentDetailModal`, `DepartmentModal`,
`DisableModal` (generic, reused across Students/Companies/Departments), `BulkAddStudentsModal`
(item 27), `ApplyModal` (the item 6/11/33 apply flow — profile summary → application preview →
auto-generated-resume submit, in one component reused by both Placements and Trainings).

**Resume** (`src/components/resume/`, `src/services/resume.js`, `src/utils/generateResumePdf.jsx`,
`src/utils/resumeExtras.js`): `ResumeDocument` is the single printable template, used both for
on-screen preview (`ResumePage`) and for off-screen auto-generation during application submit
(item 33) — one source of truth instead of the old app's two separate PDF-generation code paths.

**Services** (`src/services/`): `placements.js`, `trainings.js`, `applications.js`, `notes.js`,
`resume.js`, `check.js` (shared response-normalizer) — new; `organizationApi.js`,
`departmentApi.js`, `coordinatorApi.js` relocated here from `pages/superadmin/view/` for
consistency. All list-fetches now sort newest-first by default (item 5).

**Utils** (`src/utils/`): `getAssetUrl`, `getApplicationStatus` (single verified status_id→label
map, replacing 4 inconsistent per-file mappings), `formatDateTime`, `sortByNewest`,
`interviewLetter` (PDF letter generator, item 28), `resumeExtras` (localStorage persistence for
resume-only fields that have no backend column — see §7).

---

## 3. Duplicate files removed / merged (45 files deleted)

| Entity | Removed (per old role) | Replaced by |
|---|---|---|
| Students | `ViewStudents.jsx` ×2, `AddStudents/EditStudent/DisableStudents.jsx`, `StudentDetails.jsx` | `pages/shared/StudentsPage.jsx` + `StudentModal`/`StudentDetailModal`/`DisableModal`/`BulkAddStudentsModal` |
| Companies | `ViewCompanies/ApprovedCompanies/RejectedCompanies.jsx` | `pages/shared/CompaniesPage.jsx` (reuses existing `CompanyCard`/`RejectRemarkModal`) |
| Departments | `ViewDepartments/AddDepartment/EditDepartment.jsx` | `pages/shared/DepartmentsPage.jsx` + `DepartmentModal` |
| Placements | `PlacementActivity/PostPlacement.jsx` ×2, `ViewPlacements/PlacementDetails.jsx`, `PostJob/ManageJobs.jsx`, `JobsView.jsx` | `pages/shared/PlacementsPage.jsx` + `PlacementDetailPage.jsx` (reuses existing `PlacementForm`) |
| Trainings | `ViewTrainingActivity/PostTraining.jsx` ×2, `ViewTrainings/TrainingDetails.jsx`, `PostTraining/ManageTraining.jsx`, `TrainingView.jsx` | `pages/shared/TrainingsPage.jsx` + `TrainingDetailPage.jsx` (reuses existing `TrainingForm`) |
| Applications | `PlacementApplications/TrainingApplications.jsx` ×2, `Recruitment.jsx`, `ShortlistedCandidates.jsx`, `ApplicationsView.jsx` | `pages/shared/ApplicationsPage.jsx` (fixes a real bug — see §5) |
| Notices | `ShareNotes.jsx` ×2, `ViewNotes.jsx` | `pages/shared/NoticesPage.jsx` |
| Resume | `utils/resumeBuilder.jsx` (1094 lines), `pages/components/Resume.jsx` | `pages/shared/ResumePage.jsx` + `ResumeDocument` |
| Misc | `utils/noticesStore.js` (orphaned, unreferenced localStorage notice system) | removed, no replacement needed |

Net effect: **75 → 43 role-specific page files**, offset by 11 shared pages + the new
component/hook/service layer above — a large reduction in duplicated JSX/logic, not just a
file-count change (e.g. the Placement/Training list views previously had 4 independent
`getStatus()` implementations each; there is now exactly one).

---

## 4. Feature work completed (numbered items from the brief)

- **1 — Company Approval**: unified pending/approved/rejected tabs in `CompaniesPage`, reusing
  the existing `CompanyCard`/`RejectRemarkModal`; added a real "disable company" action wired to
  the previously-unused `DELETE /organizations/:id?status=activate|deactivate` route.
- **2 — Simplified sidebar**: Students/Companies/Departments/Placements/Trainings/Notices/
  Applications collapsed to one page each with Add/Disable as modals; sidebars simplified to
  match across all 4 roles.
- **3 — Login**: role-selection screen removed. Since the backend *requires* a matching
  `role_id` and gives no way to discover it from just an email, the frontend tries all 4
  role_ids via `Promise.any` and uses whichever succeeds — verified live against the running
  backend (see §8). Also fixed a dead/broken `/coodinator/dashboard` (typo) redirect that was
  never reachable before.
- **4 — Redirect after create**: modals close and refetch the already-open list in place — no
  separate "success" navigation needed once Add/Edit became modals.
- **5 — Sort newest first**: built into every new service module (`sortByNewest`).
- **6, 11, 33 — Apply flow**: `ApplyModal` — profile summary (Edit Profile / Continue) →
  application preview (student/resume/CGPA/backlog/skills/company/job) → on submit, the resume
  is regenerated from the current profile and re-attached (`PUT /students/me`) *before* the
  application is submitted. Verified live end-to-end, including a real bug found and fixed
  during that testing (see §8).
- **7 — Applicant details**: `ApplicationsPage`'s "View" action reuses `StudentDetailModal`
  (resume, CGPA, backlog, skills, full profile) instead of a separate near-duplicate modal.
- **8 — Placement Details Page**: `PlacementDetailPage`/`TrainingDetailPage` — banner,
  description, eligibility, company, salary, deadline, Apply/Back. (No "Location" field — the
  backend placement schema has none; see §7.)
- **9, 10, 21 — Resume**: sidebar renamed "Resume Builder" → "Resume"; opening it immediately
  generates and previews the resume (no separate builder page); ATS-friendly single-template
  PDF that hides empty sections and fits one page where possible.
- **12, 25 — Cards**: `PlacementCard`/`TrainingCard` redesigned with applicant counts; existing
  `CompanyCard` reused as-is (already solid).
- **13 — Datetime everywhere**: `formatDateTime`/`formatDate`/`formatRelative` utils applied
  across the new pages; true datetime display for applications is capped by the DB storing
  `date_of_submission` as `DATE` not `DATETIME` (documented in `DATABASE_RECOMMENDATIONS.md`).
- **14 — Application detail**: shows every field the API actually returns; no fabricated
  "updated time" since the backend doesn't track one (see §7).
- **15 — View count**: localStorage-based (no backend field exists).
- **16, 17 — Avatar/cropper**: one `AvatarUpload` (avatar + small camera icon) used by
  `ProfileView`, `StudentProfileSetup`, `SettingsPage` (SuperAdmin/Coordinator only — see §7),
  and `CompanyForm` (logo + banner) — all sharing one `ImageCropper`, verified live in a browser
  (see §8).
- **18 — Skills chips**: `SkillsInput` (comma/Enter → chip) replaces the old dual free-text +
  toggle-list UI in `ProfileView` and `StudentProfileSetup`.
- **19 — Textareas**: description fields (Notices, Company profile, Resume objective/projects)
  use `Textarea`.
- **20 — Project upload**: GitHub/Technology/Live-link fields in the Resume's project editor are
  explicitly optional and relabeled branch-agnostically ("Tools/Technology Used (optional)",
  "Link (optional)").
- **22 — Profile skills sync**: root cause was two independent, inconsistent input mechanisms
  (free-text add + toggle list) that could produce near-duplicate entries (casing/whitespace);
  replaced both with the single `SkillsInput` component.
- **23 — Application status**: single `getApplicationStatus` util, labels reconciled to
  Pending/Shortlisted/Rejected — the real backend only has 3 states (§7 explains why
  Interview/Selected aren't separate persisted states).
- **24 — Compact UI**: removed the greeting banner (`DashboardHeader`) from `DashboardShell`
  entirely — it was rendered on every single page; also fixed a duplicate-heading bug this
  surfaced (see §8), reduced default padding/font sizes, added `Breadcrumb` support.
- **26 — Placed Students**: new `PlacedStudentsPage`, using `status_id = 2` (Approved) applications
  as the closest available "placed" signal (no dedicated status exists — see §7).
- **27 — Bulk student**: `DataTable` gained optional row-selection; "Disable Selected" bulk
  action plus `BulkAddStudentsModal` (submits each row via the existing single-add endpoint,
  since no bulk-create route exists, with per-row success/failure reporting).
- **28 — Interview module**: polished the existing browser-local stub per your decision —
  added an Offline Location field, and a shared `interviewLetter.js` PDF generator used by both
  the company's "Schedule Interviews" page and the student's "Interview Letters" page (which was
  previously a static placeholder with no data fetching at all).
- **29 — Notices**: modern card UI in `NoticesPage`, shared preview modal instead of three
  separate hand-rolled ones.
- **30 — Coordinator eligibility bug**: found and fixed — `FilterEligible.jsx`'s student table
  was a literal placeholder comment (`{/* your complete table goes here */}`) with `...` in the
  summary cards; the data-fetch also unwrapped the API response one level too deep (always
  empty) and filtered on wrong field paths. Rebuilt with real data, correct field paths, and
  proper department/semester `Select` filters.
- **31 — Search trim**: built into the shared `SearchBar` (trims on blur, blocks leading spaces
  while typing).
- **32 — Light theme**: added semantic `text-orbit-text-*` tokens (didn't exist before — only
  background/border tokens were theme-aware); converted 142 raw `text-white` instances across 20
  files that were invisible in light mode, while leaving the ~28 legitimate uses (text on
  colored badges/gradients/avatars) untouched.

## 5. Real bugs found and fixed along the way (not asked for, discovered while reading code)

- Department edit sent `coordinator_name` to a strict backend schema that only accepts `name` —
  every save would have 400'd.
- Coordinator's Reject-application button called `api.get(...)` with a body (a no-op — GET
  requests don't carry bodies) instead of the `PATCH` the backend requires — rejecting an
  application from that page silently did nothing.
- `TrainingForm.jsx` checked `sessionStorage` before `localStorage` for the current user, but the
  app only ever writes to `localStorage` — the check always missed (harmless fallback, but dead
  code, now consolidated via `useAuth`).
- A typo'd `/coodinator/dashboard` redirect path in the old login flow (dead link, never
  reachable — see item 3 above).
- `AddDepartment.jsx` had two same-named `handleSubmit` function declarations (the second, real
  one silently won via hoisting; the first was dead code) — cleaned up as part of collapsing it
  into `DepartmentModal`.
- `FilterEligible.jsx` never rendered its data at all (see item 30 above).

## 6. Performance / bundle

- Removed the duplicated `res?.data?.data ?? res?.data ?? []` defensive-unwrapping pattern that
  was copy-pasted in 15+ files, in favor of consistent per-entity service functions.
- `useFetchList`/`useMasterData` deduplicate what were previously N independent fetches of the
  same reference data (departments/divisions/etc.) per page.
- `npm run build` stays a single-chunk bundle (~1.9 MB / ~540 KB gzip) throughout — no
  regression, but also flagging (as the build output already does) that route-level code
  splitting via `React.lazy` per role-dashboard would meaningfully cut initial load; not done in
  this pass since it's an orthogonal, separately-testable change.
- `React.memo` was not blanket-applied to the new card components — the lists involved are small
  (tens, not thousands, of rows) and premature memoization would have added complexity without a
  measured benefit; worth revisiting if list sizes grow substantially (see
  `DATABASE_RECOMMENDATIONS.md` §8 on the lack of API-level pagination, which is the more
  impactful bottleneck at scale).

## 7. Limitations caused by the existing backend (verified, not guessed)

All of the following were confirmed by reading backend source and, in several cases, live
end-to-end testing against the running server — not assumed from the frontend side:

- **Interview scheduling** has no backend model at all — browser-local only, per your decision.
- **View counts** have no backend field — browser-local only, matching the task's own fallback
  instruction.
- **SuperAdmin/Coordinator avatars** and **Company website/description/logo/banner** have no
  backend columns (`user_table`/`organization_table`) — both remain localStorage-only, exactly
  as they already were before this refactor; only the duplicated *UI* for editing them was fixed.
- **Notes have no edit/delete route** for any role — per your decision, the Coordinator's
  edit/delete buttons remain visible and wired exactly as before (non-functional if clicked).
- **Application status is a real 3-state system** (Pending/Approved/Rejected) — the requested
  5-label vocabulary (add Interview/Selected) is display-layer only; there's no backend state to
  back a genuine "Interview" or "Selected" status distinct from "Approved."
- **`GET /placements`/`GET /trainings`/`GET /placement-applications`/`GET /training-applications`
  scope every staff role (Organization, Coordinator, *and SuperAdmin*) to only what they
  personally created** — there is no "all placements across the college" view for anyone via
  these endpoints. This means `PlacedStudentsPage` and the Placements/Trainings list pages show
  a smaller slice of data for Coordinator/Company accounts than a true org-wide view would;
  it's a backend scoping decision, not a frontend bug (see `DATABASE_RECOMMENDATIONS.md` §8).
- **No "Location" field exists on placements** — `PlacementDetailPage` omits it rather than
  fabricate a value.
- **`api_documentation.md` is stale in several places** (organization approval codes,
  training-application status default, department registration fields, `/masters` being a path
  param not a query string, upload/notes being single-file not multi-file, and a fabricated
  self-service change-password endpoint that doesn't exist). The new `backend/openapi.yaml` was
  written from actual source, not this file — see `backend/API_DOCS.md` for the full list of
  discrepancies.

## 8. Testing performed

Per-phase, `npm run build` and `npm run lint` were run after every entity/feature (lint went
from a 92-problem baseline to 55–58 throughout this work — a net improvement despite substantial
new code, verified by diffing against a stashed clean checkout, not just eyeballed). Beyond
static checks, three flows judged highest-risk were verified **live**, against the actual
running backend and a real Chromium browser (Playwright), using throwaway test accounts created
and cleaned up via the real registration API + direct Prisma queries (read/write only to rows
created for this purpose):

1. **Login role-guessing** — confirmed via raw `curl` against `/users/login` that only the
   correct `role_id` succeeds and the other 3 fail cleanly with a generic 401, then confirmed the
   full `Promise.any` flow in-browser.
2. **Resume auto-generation + auto-attach-on-apply** — full apply flow driven in a real browser;
   confirmed via direct DB query afterward that `resume_url` was freshly regenerated and the
   application record was created correctly. **This test caught and led to fixing a real bug**:
   `ApplyModal` crashed with a null-reference error during its closing animation because the
   parent clears its payload before the modal's exit transition finishes rendering — fixed with
   a guard, then re-verified clean.
3. **Image cropper** — full select-file → crop → zoom → apply → upload flow driven in-browser,
   confirmed the avatar updates and no console errors occur.

This also surfaced the `DashboardShell` greeting-banner + duplicate-heading issue (item 24 /
`DashboardShell` fix above), caught by inspecting a screenshot from the resume test, not by
reading code — a concrete example of why the live-testing pass was worth the extra time.

**What was not** exhaustively browser-tested: every CRUD path across all 4 roles, bulk-add with
partial failures, the interview-letter cross-device limitation (inherently untestable — it's a
single-browser-only feature by design), and the full card/table matrix from item 47. These were
verified via code review, build/lint, and the patterns established by the 3 flows above, not via
individual browser runs — flagging this explicitly rather than claiming full end-to-end coverage
that wasn't actually performed.

## 9. Database & API documentation deliverables

- `backend/openapi.yaml` + `backend/swagger.json` — full OpenAPI 3.1 spec for every existing
  endpoint (41 paths, 19 reusable schemas), generated from actual source, with a documented list
  of discrepancies against the pre-existing `api_documentation.md`. `backend/API_DOCS.md`
  explains how to view it and how to optionally wire up `swagger-ui-express` later (not applied).
- `backend/DATABASE_RECOMMENDATIONS.md` — read-only schema analysis: missing relationships,
  naming inconsistencies, nullable-field review, security (token revocation, brute-force
  protection), indexing/performance, and a prioritized list of suggested new tables (Interview
  Scheduler, Notice Targeting, Resume History, Application Timeline, Company Approval History,
  View Count Tracking, and more) — recommendations only, nothing implemented.

## 10. Future enhancement recommendations (frontend)

- Route-level code splitting (`React.lazy`) per role dashboard to shrink the initial bundle.
- Server-side pagination once list endpoints support it (see `DATABASE_RECOMMENDATIONS.md` §8) —
  the frontend's `usePagination`/`useFetchList` hooks were deliberately kept simple enough to
  swap from client-side to server-side pagination without a rewrite.
- If `interview_table`/notice-targeting/resume-history land on the backend, the corresponding
  frontend pieces (`ScheduleInterviews`, `NoticesPage`, `ResumePage`) are already structured
  (service-module boundary) to swap their localStorage fallback for real API calls with minimal
  surface-area change.
- Accessibility: the new shared components (`Modal`, `DataTable`, `SearchBar`, etc.) use
  semantic HTML and visible focus states consistent with the rest of the app, but a dedicated
  accessibility pass (ARIA labels on icon-only buttons, keyboard-nav audit of the sidebar
  submenus, color-contrast check beyond the light/dark text-token fix) was not part of this
  refactor's scope and is worth a follow-up.

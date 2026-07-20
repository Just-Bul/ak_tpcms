# Database & Prisma Schema Recommendations (Read-Only)

Produced by reading `prisma/schema.prisma` and the actual service/controller code in
`src/modules/**` during a frontend-only refactor. **No schema, migration, or backend code was
changed to produce this document** — every item below is a recommendation for a separate,
deliberate backend change, not something implemented as part of this work.

---

## 1. Findings that directly explain frontend limitations hit during this refactor

These are the highest-value items — each one is the *root cause* of a feature the frontend
could only partially deliver, verified by tracing the limitation back to the schema.

| Finding | Impact | Recommendation |
|---|---|---|
| `placement_application_table.date_of_submission` and `training_application_table.date_of_submission` are `@db.Date`, not `DateTime`/`Timestamp` | The API can never return a submission *time*, only a date — no frontend change can recover time-of-day data that was never stored. This directly caps item 13 ("datetime everywhere") for applications. | Change both columns to `@db.Timestamp(0)` with `@default(now())`, matching the pattern already used on `placement_table.created_on`/`training_table.created_on`. |
| `placement_application_table` / `training_application_table` have no `updated_on` column | There is no way to know *when* an application was approved/rejected — only when it was originally submitted. Item 14 ("Application Detail: display updated time") cannot be satisfied for applications; the frontend correctly omits a fabricated value rather than showing a fake one. | Add `updated_on DateTime @default(now()) @updatedAt` to both tables. |
| `user_table` has no avatar/image column | SuperAdmin and Coordinator accounts have no server-side place to persist a profile photo, so their avatar upload (item 16/17) is necessarily a browser-local (localStorage) fallback, unlike Student/Organization which do have `image_url`. | Add `image_url String? @db.VarChar(255)` to `user_table`, or a small `user_profile_table` if avatars shouldn't live on the base identity table. |
| `organization_table` has no `website`, `description`, `logo_url`, or `banner_url` columns | Company profile "extras" (item 1's "view complete details", the Company profile page) are localStorage-only and don't survive a login from a different device/browser. `document_url` exists but no route ever writes to it (see §5). | Add the four columns to `organization_table` (or a `organization_profile_table` if the team prefers to keep the core table lean). |
| No `interview_*` model exists at all | Item 28 (interview scheduling) has zero backend support; the frontend implementation is necessarily a single-browser localStorage stub with no cross-device sync, per your explicit sign-off earlier in this session. | See §6, "Interview Scheduler". |
| No `view_count` column on `placement_table`/`training_table` | Item 15 falls back to a frontend-only (localStorage) view counter, which resets per-browser and can't be aggregated. | Add `view_count Int @default(0)` to both tables, plus an endpoint to increment it (a real counter needs a server-side atomic increment to be meaningful across users — a client-only counter can't actually count *other* users' views). |
| `note_table` has no department/semester scoping columns | Notices currently have no targeted-visibility mechanism at all — every notice is visible to every authenticated (and even unauthenticated, since `GET /notes` requires no auth) user. Section 47's NoticeCard spec asks for "Department Visibility" / "Semester Visibility" display, which has nothing to bind to today. | See §6, "Notice Targeting". |

---

## 2. Missing relationships / normalization

- **`status_table` is a single generic lookup shared by three unrelated concepts** — organization approval, placement-application status, and training-application status all FK into the same `status_table` via `approval_id`/`status_id`. Today the numeric values happen to align (1/2/3 ≈ pending/approved/rejected in all three), but that's coincidental, not enforced — nothing stops a future migration from adding a status row that makes sense for one entity and not the others, and the requested 5-state application vocabulary (Pending/Shortlisted/Interview/Selected/Rejected — see item 23) can't be added without either overloading this shared table with organization-irrelevant states or duplicating it. Recommend splitting into `organization_approval_status_table` and `application_status_table` (or similar), each independently extensible.
- **`organization_table.document_url` is unused by any current route.** `organizationRegisterSchema` doesn't accept it and no update route writes it — either a registration-document upload flow was planned but never wired up, or this column is dead. Worth confirming with the team before the next migration touches this table.
- **No junction table for notice → department/semester targeting** (see §1) — the schema already has the exact pattern needed (`placement_department_table`, `placement_semester_table`, `training_department_table`, `training_semester_table`); a `note_department_table`/`note_semester_table` pair would be a one-for-one copy of that established pattern.

## 3. Naming inconsistencies

- `department_table.department_name` is `String?` (nullable) despite being effectively required — `departmentRegisterSchema` always requires it, and no code path creates a department without one. Recommend making it `String` (NOT NULL).
- `role_table.role` is similarly `String?` despite the 4 roles being fixed, seeded, and never created dynamically through the API. Recommend `String` (NOT NULL).
- Frontend-facing docs and code alike are inconsistent about whether the coordinator-management folder/module is called "admin" or "coordinator" — not a DB issue, but worth a mention since it caused real confusion during this refactor (see the frontend refactor report).
- `student_table.tenth_division_id` / `twelfth_division_id` and their divergent relation names (`student_table_tenth_division_idTodivision_table` etc.) are correct Prisma disambiguation but make the generated client verbose; no action needed, just noting it's expected given two FKs to the same table.

## 4. Nullable-field review

- `student_table.has_backlog Boolean? @default(false)` and `placement_table.has_backlog Boolean?` (no default on the placement side) — recommend both be NOT NULL with an explicit default; a nullable boolean here means "false" and "unknown" are indistinguishable, and the frontend already has to treat `null`/`undefined`/`false` identically as a workaround.
- `student_table.category_id Int? @default(1)` / `semester_id Int? @default(1)` — these silently default to whatever row currently has `category_id`/`semester_id` = 1 if omitted at creation. Recommend either making them required (forcing every student-creation call to specify a real value) or documenting explicitly what id `1` represents so it isn't accidentally reseeded to something else later.
- No CHECK constraint (MySQL 8+ supports them) on `cgpa` (`Decimal(4,2)`) to keep it within a sane 0.00–10.00 range — currently enforced only in the Zod layer, so a direct DB write (migration script, admin tool, etc.) could insert an out-of-range value with nothing to stop it.

## 5. Security

- **`user_table.auth_token` persists the last-issued JWT on the user row.** This is unusual for a stateless-JWT design and doesn't add revocation capability (the token remains valid until its 12h expiry regardless of what's in this column) while adding a place a stolen DB backup could leak a currently-valid token. Recommend either removing the column (if nothing reads it) or repurposing it into a real revocation mechanism — see next point.
- **No token revocation / versioning.** Changing a password, disabling a user, or a SuperAdmin force-resetting someone's password (`POST /users/change-passwrord/:user_id`) does not invalidate that user's existing JWTs — they remain valid for up to 12 hours after a password change. Recommend a `token_version Int @default(0)` column on `user_table`, embedded as a JWT claim and checked on every authenticated request; incrementing it on password change/disable immediately invalidates all previously-issued tokens.
- **No brute-force protection at the account level** — only IP-based rate limiting exists (`apiLimit`, 50 req/min). A distributed attacker or one behind a shared IP/NAT isn't meaningfully slowed down. Recommend `failed_login_attempts` + `locked_until` columns on `user_table` for account-level lockout, independent of the IP-based limiter.
- **Passwords appear to be hashed** (bcrypt, via `PasswordManager`) — good practice, no change recommended there.

## 6. Suggested new tables (recommendations only — not implemented)

- **Interview Scheduler / Interview History** — an `interview_table` (placement_id or training_id, student_id, scheduled_by, date, time, mode, meeting_link, offline_location, status) plus an `interview_history_table` or `updated_on`/status-change log, so item 28 can eventually move off the current browser-local stub onto real, cross-device data.
- **Interview Feedback** — `interview_feedback_table` (interview_id, rating, notes, recommended boolean) for the interviewer to leave structured notes.
- **Notice Targeting** — `note_department_table` / `note_semester_table` junctions, mirroring the existing placement/training targeting pattern (see §2).
- **Resume History** — `resume_history_table` (student_id, resume_url, generated_on) so a student's past resume versions/snapshots aren't overwritten and lost every time `resume_url` is updated on `student_table` — directly relevant to item 33 (auto-regeneration on every application), which today silently overwrites the previous resume with no history.
- **Application Timeline / Audit Log** — a generic `application_status_log_table` (application type, placement_id/training_id, student_id, old_status_id, new_status_id, changed_by, changed_on) — would also retroactively fill the "updated_on" gap in §1 with full history, not just a last-modified timestamp.
- **Company Approval History** — `organization_approval_log_table` (organization_id, approval_id, remarks, changed_by, changed_on) — today only the *current* approval_id/remarks are stored; a rejected-then-reapplied company's history is lost on the next status change.
- **View Count Tracking** — see §1; a simple counter column is enough for a basic count, but a `placement_view_table` (placement_id, viewer_user_id, viewed_on) would additionally enable "unique viewers" and view-over-time analytics if that's ever wanted.
- **Student Achievement** — `student_achievement_table` (student_id, title, description, date, certificate_url) for non-placement accomplishments (hackathons, certifications) — orthogonal to the resume-only "certificates" the frontend currently keeps in localStorage (see the frontend refactor report's "Additional Information" limitation).
- **Placement Statistics** — a small aggregation/materialized table or scheduled job output (per department per year: students placed, average package, highest package) would let the frontend's new "Placed Students" view (item 26) show real trend statistics instead of only a live list derived from `status_id = 2` applications.
- **Notification History** — the frontend's "Notifications" feature is entirely synthesized client-side from applications/placements data (see `services/notifications.js`); a real `notification_table` (recipient_id, type, message, read boolean, created_on) would let notifications persist, be marked read/unread, and include events the frontend can't currently infer (e.g., "your application was viewed").
- **Activity/Audit Logs (general)** — a catch-all `audit_log_table` (actor_id, action, entity_type, entity_id, changed_on, metadata JSON) for admin-level accountability across the whole system, independent of the entity-specific logs above.

## 7. Indexing & performance

- `organization_table.is_active` has no index (only `approval_id` does) — `GET /organizations?status=all` combined with any future "active only" filter would table-scan at scale.
- No composite index covers `(placement_id, status_id)` or `(student_id, status_id)` on `placement_application_table`/`training_application_table` — both are natural query patterns (count applicants by status for a placement; find a student's approved applications) that the frontend currently satisfies by fetching the *entire* application list and filtering client-side (see `PlacedStudentsPage`, `ApplicationsPage`), precisely because there's no server-side status filter to push the work down to. Recommend adding the composite indexes *and* a `?status_id=` query parameter to both list endpoints so large installations don't have to ship every application row to the browser just to show "approved only."
- No full-text index on `placement_table.title`/`description` or `training_table.title`/`description` — fine at current scale; worth adding a MySQL `FULLTEXT` index if/when a "search placements by description" feature is requested, rather than relying on the frontend's client-side substring filter indefinitely.

## 8. Scalability / data consistency

- `GET /placements`, `GET /trainings`, `GET /placement-applications`, `GET /training-applications`, `GET /students/`, `GET /organizations`, `GET /notes` all return their **entire** result set with no pagination (`?page=`/`?limit=`) support anywhere in the API. The frontend paginates client-side after fetching everything, which is fine at the current small dataset size but will not scale — recommend adding standard offset/cursor pagination to the list endpoints before the student/application counts grow significantly.
- `Placement.findByCreatorId`/`Training.findByCreatorId` scope every staff role (Organization, Coordinator, **and SuperAdmin**) to only what they personally created, with no "all placements across the college" view for anyone. This is consistent, intentional-looking behavior, not a bug — but it means a SuperAdmin auditing total placement activity currently has no endpoint that returns more than their own postings. Worth confirming this is the intended model; if not, a role-aware "all placements" path (SuperAdmin sees everything, Coordinator sees their department's, Organization sees their own) would be a meaningful product improvement.

---

*This report reflects the schema and code as read during the frontend refactor session. Re-verify against the current schema before acting on any item, since backend development continues independently of this document.*

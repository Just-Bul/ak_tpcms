# Frontend Integration Guide - TPCMS New Features

This guide provides instructions, API contracts, and code examples for the frontend team to integrate the newly implemented backend capabilities:
1. **Filtering Students by Grade, Regular vs. Alumni, Semester, Branch, and Graduation Year**
2. **Dashboard Metric Cards as Clickable Navigation Buttons**
3. **Open Opportunity Browsing (Students Can View All Postings Even If Ineligible)**
4. **Notification System (Broadcast to All, Apply Restricted to Eligible Candidates)**
5. **Student Document Repository & Grade Card Review**
6. **T&P Cell Application Verification vs. Organization Role Permissions**
7. **Graduation Year Management & Updates**

---

## 1. Student Filtering & Status

### Backend Changes Summary
- **Database Status Convention**:
  - `status = "Regular"`: Active current students (`graduation: false`, `is_graduate: false`).
  - `status = "Alumni"`: Graduated students (`graduation: true`, `is_graduate: true`), tracked in `alumni_table` with `passing_year`.
- Returned student objects include:
  `graduation`, `is_graduate`, `status` ("Regular" | "Alumni"), `graduation_year`, `grade_card_url`, `alumni_details`, and `documents`.

### API Request
```http
GET /students?status=regular&grade=7.5&semester_id=6&branch_id=1&graduation_year=2024&search=John
Authorization: Bearer <token>
```

### Supported Query Parameters (All Optional)
| Parameter | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `status` | string | `regular`, `alumni`, `all` | Filter by regular current students or alumni |
| `grade` or `min_cgpa` | number | `7.5` | Minimum CGPA threshold |
| `max_cgpa` | number | `10.0` | Maximum CGPA threshold |
| `semester_id` | number | `6` | Filter by current semester ID |
| `department_id` or `branch_id` | number | `1` | Filter by department/branch ID |
| `graduation_year` or `passing_year` | number | `2024` | Filter by graduation year or alumni passing year |
| `has_backlog` | boolean | `false` | Filter by backlog status |
| `search` | string | `Rahul` | Search across student name, roll number, or email |

### Example API Response
```json
{
  "success": true,
  "message": "Successfully fetched students",
  "data": [
    {
      "user_id": 6,
      "roll_no": "20BCE0012",
      "cgpa": "8.50",
      "has_backlog": false,
      "graduation": false,
      "is_graduate": false,
      "status": "Regular",
      "graduation_year": 2025,
      "grade_card_url": "/public/document_media/172044-gradecard.pdf",
      "department_table": { "department_id": 1, "department_name": "Computer Science" },
      "semester_table": { "semester_id": 6, "semester": "6th Semester" },
      "user_table": { "name": "Rahul Sharma", "email": "rahul@college.edu", "mobile_no": "9876543210" },
      "alumni_table": null,
      "documents": [
        {
          "document_id": 1,
          "document_type": "grade_card",
          "document_name": "Semester 5 Grade Card",
          "document_url": "/public/document_media/172044-gradecard.pdf",
          "verified": true
        }
      ]
    }
  ]
}
```

### Frontend Implementation Example (React)
```tsx
import React, { useState } from "react";

export const StudentFilterBar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    status: "all",
    grade: "",
    semester_id: "",
    branch_id: "",
    graduation_year: "",
    search: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 bg-white rounded-lg shadow">
      {/* Search Input */}
      <input
        type="text"
        name="search"
        placeholder="Search name, roll..."
        value={filters.search}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      {/* Status: Regular vs. Alumni */}
      <select name="status" value={filters.status} onChange={handleChange} className="border p-2 rounded">
        <option value="all">All Students</option>
        <option value="regular">Regular Students</option>
        <option value="alumni">Alumni</option>
      </select>

      {/* Min CGPA */}
      <input
        type="number"
        step="0.1"
        name="grade"
        placeholder="Min CGPA (e.g. 7.5)"
        value={filters.grade}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      {/* Semester */}
      <select name="semester_id" value={filters.semester_id} onChange={handleChange} className="border p-2 rounded">
        <option value="">All Semesters</option>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
          <option key={sem} value={sem}>{`Sem ${sem}`}</option>
        ))}
      </select>

      {/* Graduation Year */}
      <input
        type="number"
        name="graduation_year"
        placeholder="Graduation Year"
        value={filters.graduation_year}
        onChange={handleChange}
        className="border p-2 rounded"
      />
    </div>
  );
};
```

---

## 2. Converting Dashboard Data to Clickable Redirect Buttons

Convert dashboard summary counter boxes into clickable button cards that redirect to filtered lists using `react-router-dom`:

```tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, GraduationCap, Briefcase, Clock } from "lucide-react";

export const DashboardStats = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
      {/* 1. Regular Students Button */}
      <button
        onClick={() => navigate("/admin/students?status=regular")}
        className="flex items-center justify-between p-5 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 hover:shadow-md transition text-left cursor-pointer"
      >
        <div>
          <p className="text-sm font-medium text-blue-600">Regular Students</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats?.regularStudentsCount ?? 0}</h3>
        </div>
        <Users className="w-8 h-8 text-blue-500" />
      </button>

      {/* 2. Alumni Students Button */}
      <button
        onClick={() => navigate("/admin/students?status=alumni")}
        className="flex items-center justify-between p-5 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 hover:shadow-md transition text-left cursor-pointer"
      >
        <div>
          <p className="text-sm font-medium text-purple-600">Alumni Students</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats?.alumniCount ?? 0}</h3>
        </div>
        <GraduationCap className="w-8 h-8 text-purple-500" />
      </button>

      {/* 3. Active Placements Button */}
      <button
        onClick={() => navigate("/placements")}
        className="flex items-center justify-between p-5 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 hover:shadow-md transition text-left cursor-pointer"
      >
        <div>
          <p className="text-sm font-medium text-green-600">Active Placements</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats?.placementCount ?? 0}</h3>
        </div>
        <Briefcase className="w-8 h-8 text-green-500" />
      </button>

      {/* 4. Pending Review Applications Button */}
      <button
        onClick={() => navigate("/admin/applications?status=pending")}
        className="flex items-center justify-between p-5 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 hover:shadow-md transition text-left cursor-pointer"
      >
        <div>
          <p className="text-sm font-medium text-amber-600">Pending T&P Review</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats?.pendingApplicationsCount ?? 0}</h3>
        </div>
        <Clock className="w-8 h-8 text-amber-500" />
      </button>
    </div>
  );
};
```

---

## 3. Open Opportunity Browsing (Viewing Postings Even If Ineligible)

### Rule
**Students can see and read all placement drives and training programs regardless of eligibility.**
Ineligible students are never blocked from viewing details; only the submission of the application is restricted.

### Endpoints
* `GET /placements` — Returns all active campus placement postings.
* `GET /placements/:id` — Returns full details of any placement posting.
* `GET /trainings` — Returns all active training postings.
* `GET /trainings/:id` — Returns full details of any training program.
* `GET /placements/is-eligible/:id` — Check eligibility for a placement: `{ isEligible: boolean, reason: string }`.
* `GET /trainings/is-eligible/:id` — Check eligibility for a training: `{ isEligible: boolean, reason: string }`.

### Application Enforcement
If an ineligible student attempts to submit an application (`POST /placement-applications` or `POST /training-applications`), the backend rejects it with **HTTP 400 Bad Request** and returns the specific disqualification reason (e.g. `Minimum CGPA of 7.5 required (your CGPA: 6.8)`).

---

## 4. Notification System (Broadcast to All, Apply Restricted to Eligible Candidates)

### Behavior
- `GET /notifications` returns **ALL** active placement and training announcements to every student.
- Each notification item is enriched with the student's eligibility assessment:
  - `is_eligible`: `true` or `false`
  - `eligibility_reason`: Explains why eligible or why rejected (e.g. `Minimum CGPA of 7.5 required (your CGPA: 6.8)`, `Application deadline has passed`, `Current semester is not eligible`).
  - `can_apply`: `true` only if `is_eligible && !has_applied && !deadlinePassed`.
  - `has_applied`: `true` if student already submitted an application.
  - `application_status`: `"Pending"` | `"Approved"` | `"Rejected"` | `null`.

### Endpoint
```http
GET /notifications?section=all&filter=all
Authorization: Bearer <token>
```
Optional query filters:
- `section`: `"all"` | `"placement"` | `"training"`
- `filter`: `"all"` | `"eligible"` | `"ineligible"` | `"applied"`

### Frontend Implementation Example
```tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export const NotificationFeed = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");

  const loadNotifications = async (selectedFilter) => {
    const res = await axios.get(`/notifications?filter=${selectedFilter}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setNotifications(res.data.data);
  };

  useEffect(() => {
    loadNotifications(filter);
  }, [filter]);

  const handleApply = async (item) => {
    try {
      const endpoint = item.notification_type === "placement" 
        ? "/placement-applications" 
        : "/training-applications";
      const payload = item.notification_type === "placement"
        ? { placement_id: item.id }
        : { training_id: item.id };

      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert("Application submitted successfully!");
      loadNotifications(filter);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply");
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {["all", "eligible", "ineligible", "applied"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full capitalize text-sm font-medium ${
              filter === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification Cards */}
      {notifications.map((item) => (
        <div key={`${item.notification_type}-${item.id}`} className="p-5 bg-white border rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                item.notification_type === "placement" ? "bg-indigo-100 text-indigo-700" : "bg-teal-100 text-teal-700"
              }`}>
                {item.notification_type}
              </span>
              <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
            </div>
            <p className="text-sm text-gray-500">{item.company_name} • Min CGPA: {item.min_cgpa ?? "None"}</p>
            
            {/* Eligibility Status Badge */}
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                item.is_eligible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {item.is_eligible ? "Eligible" : "Not Eligible"}
              </span>
              <span className="text-xs text-gray-500">{item.eligibility_reason}</span>
            </div>
          </div>

          {/* Action / Apply Button */}
          <div>
            {item.has_applied ? (
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                item.application_status === "Approved" ? "bg-green-50 text-green-700 border border-green-300" :
                item.application_status === "Rejected" ? "bg-red-50 text-red-700 border border-red-300" :
                "bg-amber-50 text-amber-700 border border-amber-300"
              }`}>
                Application {item.application_status}
              </span>
            ) : item.can_apply ? (
              <button
                onClick={() => handleApply(item)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition"
              >
                Apply Now
              </button>
            ) : (
              <button
                disabled
                title={item.eligibility_reason}
                className="px-5 py-2 bg-gray-200 text-gray-400 font-medium rounded-lg cursor-not-allowed"
              >
                Not Eligible
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## 5. Student Document Repository & Grade Card Review

### Workflow
1. **Upload File**:
   - `POST /uploads/document` with `multipart/form-data` (`media: <file>`).
   - Returns `{ success: true, data: "/public/document_media/172044-gradecard.pdf" }`.
2. **Save Document Record**:
   - `POST /students/documents`
   - Payload:
     ```json
     {
       "document_type": "grade_card",
       "document_name": "Semester 5 Grade Card",
       "document_url": "/public/document_media/172044-gradecard.pdf"
     }
     ```
   - *Note*: If `document_type` contains `"grade"`, the backend automatically synchronizes `student_table.grade_card_url`.
3. **Fetch Documents**:
   - `GET /students/documents/me` (Student self)
   - `GET /students/:user_id/documents` (T&P Cell viewing student documents)
4. **Verify Document (T&P Cell Only)**:
   - `PATCH /students/documents/:document_id/verify` with body `{ "verified": true }`.
5. **Delete Document**:
   - `DELETE /students/documents/:document_id`

---

## 6. T&P Cell Application Verification vs. Organization Role

### Critical Permission Rule
* **Organizations (`role_id: 4`) CANNOT approve or reject student applications.**
* Application approval/rejection is **strictly reserved for T&P Cell (`role_id: 1` SuperAdmin, `role_id: 3` Coordinator).**
* Attempting an approval as an Organization will receive `403 Forbidden`.

### Frontend Implementation
1. **If logged in as Organization (`role_id === 4`)**:
   - Hide the "Approve" and "Reject" buttons.
   - Display the verification status badge:
     `application.verified_by ? "Verified & Approved by T&P Cell" : "Pending T&P Cell Verification"`
2. **If logged in as T&P Cell (`role_id === 1 || role_id === 3`)**:
   - Render the "Review Documents" button linking to student documents and grade cards (`application.student_table.documents` or `application.student_table.grade_card_url`).
   - Render the **Approve** and **Reject** action buttons:
     - `POST /placement-applications/approve/:placement_id/:student_id`
     - `POST /placement-applications/reject/:placement_id/:student_id`
     - `POST /training-applications/update-state` with `{ student_id, training_id, status: "approve" | "reject" }`

---

## 7. Profile Updates, Graduation Year & Backlog Management

### Supported Endpoints for Updating Graduation Year & Backlog Status

Both `graduation_year` (or `passing_year`) and `has_backlog` can be updated dynamically or set at account registration.

#### A. Student Self-Update
* **Route**: `PUT /students/me`
* **Access**: Logged-in Student (`Role.Student = 2`)
* **Payload**:
  ```json
  {
    "has_backlog": false,
    "graduation_year": 2025,
    "graduation": false,
    "status": "regular",
    "cgpa": 8.5,
    "grade_card_url": "/public/document_media/172044-gradecard.pdf"
  }
  ```
  *(Both `graduation_year` and `passing_year` are accepted by the backend).*

#### B. Admin / Coordinator Update
* **Route**: `PUT /students/:user_id`
* **Access**: `SuperAdmin` (Role 1)
* **Payload**:
  ```json
  {
    "has_backlog": false,
    "graduation_year": 2024,
    "graduation": true,
    "status": "alumni",
    "current_company": "Infosys",
    "designation": "Systems Engineer"
  }
  ```

#### C. Student Registration
* **Route**: `POST /students`
* **Access**: `SuperAdmin` (Role 1)
* **Payload**: Accepts `has_backlog` (boolean, defaults to `false`), `graduation` (boolean, defaults to `false`), and `graduation_year` (number) directly when creating student accounts:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@college.edu",
    "password": "Password123!",
    "roll_no": "21BCE045",
    "department_id": 1,
    "semester_id": 6,
    "has_backlog": false,
    "graduation": false,
    "graduation_year": 2025
  }
  ```

#### D. Filtering by Backlog Status
Admins and Coordinators can filter students with or without active backlogs using the query string:
```http
GET /students?has_backlog=false
GET /students?has_backlog=true
```

#### Automatic Backend Synchronization
Updating `graduation_year` or `graduation: true`:
1. Sets `student_table.graduation_year`.
2. Upserts `alumni_table.passing_year` with the student's passing year.
3. Synchronizes `graduation: true`, `is_graduate: true`, and `status: "Alumni"`.
4. Conversely, setting `graduation: false` or `status: "regular"` marks the student as a currently enrolled regular student.


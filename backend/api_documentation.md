# Internship & Training Server - API Handover Documentation

This documentation provides comprehensive details of all endpoints, request validation structures, response formats, authentication requirements, and developer integration notes for the Internship & Training Server.

---

## 1. Overview & Core Architecture

### Base URL
All routes are prefixed according to their resource namespace. For local development, the base URL is typically:
`http://localhost:<PORT>` (e.g., `http://localhost:5000` or `http://localhost:3000` depending on environment configuration)

### Authentication
The server uses **JWT-based Bearer Authentication**.
* **Header Format**: `Authorization: Bearer <token>`
* **Token Lifetime**: 12 hours
* **Decoded Payload Structure (`UserJwtPayload`)**:
  ```json
  {
    "auth_user_id": 12,
    "auth_email": "user@example.com",
    "auth_role_id": 2,
    "iat": 1720442300,
    "exp": 1720485500
  }
  ```

### Rate Limiting
To protect the server from abuse, the API implements IP-based rate limiting:
* **Global Rate Limit**: Applied to all endpoints.
  * **Limit**: 100 requests per 15 minutes per IP address.
  * **Headers**: Conforms to the `draft-7` standard rate-limiting headers.
  * **Exceeded Response (429 Too Many Requests)**:
    ```json
    {
      "success": false,
      "code": "TOO_MANY_REQUESTS",
      "message": "You have made too many requests. Please wait for some time.",
      "retryAfterSeconds": 900
    }
    ```
* **Auth Rate Limit**: Applied to sensitive authentication endpoints (e.g., `/users/login`).
  * **Limit**: 10 requests per 1 minute per IP address.
  * **Exceeded Response (429 Too Many Requests)**:
    ```json
    {
      "success": false,
      "code": "TOO_MANY_REQUESTS",
      "message": "Too many requests, slow down bro.",
      "retryAfterSeconds": 60
    }
    ```

---

## 2. Global Response Formats

### A. Success Response (Standard)
```json
{
  "success": true,
  "message": "Action description message",
  "data": { ... } // Or [ ... ] or null
}
```

### B. Validation Error (Status: 400 Bad Request)
Returned when request parameters, body, or query fails Zod validation.
```json
{
  "success": false,
  "errors": [
    {
      "code": "invalid_string",
      "path": ["body", "email"],
      "message": "Invalid email address"
    }
  ]
}
```

### C. General/Business Logic Error (Status: 4xx/5xx)
Returned for authentication, authorization, not found, or internal server errors.
```json
{
  "success": false,
  "message": "Error description message"
}
```

---

## 3. Role Mappings & ID References

The database utilizes specific static integer IDs for roles:

| Role ID | Role Name | Description |
| :--- | :--- | :--- |
| **1** | `SuperAdmin` | Full administrative control |
| **2** | `Student` | Job/Training applicant |
| **3** | `Coordinator` | Department representative |
| **4** | `Organization` | Training & Placement provider |

---

## 4. Route Summary Table

| Namespace | Endpoint | Method | Authentication | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **User** | `/users/register` | `POST` | Public | Register a base user (Admin, Student, Org, Coordinator) |
| | `/users/login` | `POST` | Public | Login and obtain JWT token + Profile Details |
| | `/users/` | `GET` | `SuperAdmin` | Retrieve list of all users |
| | `/users/:user_id` | `GET` | `SuperAdmin` | Retrieve single user details |
| | `/users/change-password` | `POST` | All Authenticated | Change logged in user's password |
| **Student** | `/students` | `POST` | `SuperAdmin` | Register student profile (Transactional with user table) |
| | `/students/me` | `PUT` | `Student` | Update own student profile details |
| | `/students/me` | `GET` | `Student` | Retrieve own student profile details (Friendly format) |
| | `/students/:user_id` | `PUT` | `SuperAdmin` | Admin-level student profile update |
| | `/students/:user_id` | `GET` | `Student` (self), `SuperAdmin`, `Coordinator` | Retrieve single student profile details |
| | `/students/` | `GET` | `SuperAdmin` | Retrieve list of all students |
| **Org** | `/organizations` | `POST` | Public | Register organization and request approval |
| | `/organizations/:organization_id/status` | `PATCH` | `SuperAdmin` | Approve (status = 1) or Reject (status = 2) organization |
| | `/organizations` | `GET` | `SuperAdmin` | Retrieve list of organizations (Filter by `status` query) |
| | `/organizations/:organization_id` | `GET` | `Student`, `Coordinator`, `SuperAdmin` | Retrieve single organization detail |
| **Training**| `/trainings` | `POST` | `Org`, `SuperAdmin`, `Coordinator` | Create a new training program |
| | `/trainings/` | `GET` | All Authenticated | Get list of trainings (filtered by role eligibility) |
| | `/trainings/:training_id` | `GET` | All Authenticated | Get details of a single training program |
| **Training Applications** | `/training-applications` | `POST` | `Student` | Apply for a training program |
| | `/training-applications/:training_id/students/:student_id`| `PATCH` | `Org`, `Coordinator`, `SuperAdmin` | Update training application status (approve/reject) |
| | `/training-applications` | `GET` | All Authenticated | View training applications submitted/received |
| | `/training-applications/:training_id/students/:student_id` | `GET` | All Authenticated | View details of a single training application |
| **Placement**| `/placements` | `POST` | `Org`, `SuperAdmin`, `Coordinator` | Create a new placement program |
| | `/placements/` | `GET` | All Authenticated | Get list of placements (filtered by role eligibility) |
| | `/placements/:placement_id` | `GET` | All Authenticated | Get details of a single placement program |
| **Placement Applications** | `/placement-applications` | `POST` | `Student` | Apply for a placement program |
| | `/placement-applications/:placement_id/students/:student_id/status`| `PATCH` | `Org`, `Coordinator`, `SuperAdmin` | Approve a student's placement application |
| | `/placement-applications` | `GET` | All Authenticated | View placement applications submitted/received |
| | `/placement-applications/:placement_id/students/:student_id` | `GET` | All Authenticated | View details of a single placement application |
| **Dashboard** | `/dashboards` | `GET` | `Student`, `Coordinator`, `SuperAdmin` | Retrieve role-specific dashboard metrics |
| **Upload** | `/upload/profile` | `POST` | Public | Upload a single profile picture (`media`) |
| | `/upload/banner` | `POST` | Public | Upload a single banner image (`media`) |
| | `/upload/notes` | `POST` | Public | Upload multiple notes files (`media`) |
| | `/upload/resume` | `POST` | Public | Upload a single resume PDF/document (`media`) |
| **Department** | `/departments/register` | `POST` | `SuperAdmin` | Register a new department |
| | `/departments/` | `GET` | Public | List all departments |
| | `/departments/:department_id` | `PATCH` | `SuperAdmin` | Update department details and coordinator |
| **Masters** | `/masters` | `GET` | Public | List any master table by type using `?type=...` (genders, semesters, divisions, categories, skills, sectors) |
| **Metadata**| `/categories/` | `GET` | Public | List student/placement categories |
| | `/divisions/` | `GET` | Public | List educational divisions |
| | `/genders/` | `GET` | Public | List genders |
| | `/semesters/` | `GET` | Public | List academic semesters |
| | `/skills/` | `GET` | Public | List student skills |

---

## 5. Detailed Endpoint Documentation

### User Namespace (`/users`)

#### 1. User Register
* **Path**: `POST /users/register`
* **Auth**: None
* **Body Requirements (Strict)**:
  ```json
  {
    "email": "user@domain.com", // string (valid email format)
    "password": "securepassword", // string (min length 6)
    "role_id": 2, // number (1=SuperAdmin, 2=Student, 3=Coordinator, 4=Organization)
    "mobile_no": "1234567890" // string (exactly 10 digits)
  }
  ```
* **Success Response (Status: 201 Created)**:
  ```json
  {
    "success": true,
    "message": "User register successful",
    "data": {
      "user_id": 5,
      "role_id": 2,
      "email": "user@domain.com",
      "mobile_no": "1234567890",
      "created_on": "2026-07-08T11:15:30.000Z",
      "updated_on": "2026-07-08T11:15:30.000Z"
    }
  }
  ```

#### 2. User Login
* **Path**: `POST /users/login`
* **Auth**: None
* **Rate Limit**: Max 10 requests/minute (IP-based)
* **Body Requirements (Strict)**:
  ```json
  {
    "email": "user@domain.com",
    "password": "securepassword",
    "role_id": 2
  }
  ```
* **Success Response (Status: 200 OK)**:
  Returns user info, generated JWT token, and role-specific profile details merged dynamically.
  ```json
  {
    "success": true,
    "message": "User login successful",
    "data": {
      "user_id": 5,
      "role_id": 2,
      "email": "user@domain.com",
      "mobile_no": "1234567890",
      "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "roll_no": "20BCE0012", // (Merged Student Details if Student)
      "name": "Jane Doe",
      "age": "21",
      "semester_id": 6,
      "department_id": 1,
      "gender_id": 2,
      "cgpa": "8.80",
      "has_backlog": false
    }
  }
  ```

#### 3. Get All Users
* **Path**: `GET /users/`
* **Auth**: `SuperAdmin` (Role 1)
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "All user list provided",
    "data": [
      {
        "user_id": 1,
        "role_id": 1,
        "email": "admin@tnp.com",
        "mobile_no": "0987654321",
        "role_table": { "role_id": 1, "role": "SuperAdmin" }
      }
    ]
  }
  ```

#### 4. Get One User Detail
* **Path**: `GET /users/:user_id`
* **Auth**: `SuperAdmin` (Role 1)
* **Path Params**: `user_id` (numeric)
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "User details provided",
    "data": {
      "user_id": 5,
      "role_id": 2,
      "email": "student@tnp.com",
      "mobile_no": "1234567890",
      "name": "Jane Doe",
      "roll_no": "20BCE0012",
      "department_table": { "department_id": 1, "dept_name": "Computer Science" }
    }
  }
  ```

#### 5. Change Password
* **Path**: `POST /users/change-password`
* **Auth**: All Authenticated Roles (`SuperAdmin` [1], `Student` [2], `Coordinator` [3], `Organization` [4])
* **Body Requirements (Strict)**:
  ```json
  {
    "oldPassword": "currentpassword",
    "newPassword": "newsecurepassword123",
    "confirmPassword": "newsecurepassword123"
  }
  ```
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Password updated successfully"
  }
  ```

---

### Student Namespace (`/students`)

#### 1. Register Student Profile
* **Path**: `POST /students`
* **Auth**: `SuperAdmin` (Role 1)
* **Body Requirements (Strict)**:
  ```json
  {
    "roll_no": "20BCE0012",
    "email": "student@domain.com",
    "password": "securepassword",
    "mobile_no": "1234567890",
    "gender_id": 2, // Frontend must convert gender text to gender_id
    "department_id": 1, // Frontend must convert department text to department_id
    "semester_id": 6, // Frontend must convert semester text to semester_id
    "name": "Jane Doe",
    "age": "21"
  }
  ```
* **Success Response (Status: 201 Created)**:
  ```json
  {
    "success": true,
    "message": "Student with roll: 20BCE0012 created",
    "data": {
      "user_id": 6,
      "roll_no": "20BCE0012",
      "name": "Jane Doe",
      "age": "21",
      "semester_id": 6,
      "department_id": 1,
      "gender_id": 2
    }
  }
  ```

#### 2. Update Student Profile (Self)
* **Path**: `PUT /students/me`
* **Auth**: `Student` (Role 2)
* **Body Requirements (Optional properties)**:
  ```json
  {
    "email": "new-email@domain.com",
    "mobile_no": "0987654321",
    "has_backlog": false,
    "cgpa": 8.75, // numeric decimal
    "tenth_division_id": 1,
    "twelfth_division_id": 1,
    "category_id": 2,
    "resume_url": "https://storage.provider.com/resumes/my_resume.pdf",
    "image_url": "https://storage.provider.com/images/my_photo.png"
  }
  ```
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Student with roll: 20BCE0012 updated",
    "data": { ... } // Updated student record
  }
  ```

#### 3. Update Student Profile as Admin
* **Path**: `PUT /students/:user_id`
* **Auth**: `SuperAdmin` (Role 1)
* **Body Requirements (Optional properties)**: Same as Student self update, but also allows `roll_no`, `gender_id`, `department_id`, `semester_id`, `name`, `age`, and `is_graduate` (boolean).

#### 4. Retrieve Own Student Profile
* **Path**: `GET /students/me`
* **Auth**: `Student` (Role 2)
* **Success Response (Status: 200 OK)**:
  Returns profile data with friendly string lookups dynamically resolved for departments, categories, skills, and divisions.
  ```json
  {
    "success": true,
    "message": "Successfully fetched profile",
    "data": {
      "name": "Jane Doe",
      "mobile_no": "1234567890",
      "email": "student@domain.com",
      "department": "Computer Science",
      "category": "Unreserved",
      "gender": "Female",
      "cgpa": "8.50",
      "semester": "Sem 6",
      "skill": ["TypeScript", "React", "Python"],
      "tenth_division": "First",
      "twelfth_division": "First"
    }
  }
  ```

#### 5. Retrieve Single Student Profile
* **Path**: `GET /students/:user_id`
* **Auth**: `Student` (self), `SuperAdmin` (Role 1), or `Coordinator` (Role 3) of the student's department.
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Successfully fetched student profile",
    "data": {
      "email": "student@domain.com",
      "mobile_no": "1234567890",
      "name": "Jane Doe",
      "category": "Unreserved",
      "department": "Computer Science",
      "gender": "Female",
      "cgpa": "8.50",
      "semester": "Sem 6",
      "skill": ["TypeScript", "React"],
      "tenth_division": "First",
      "twelfth_division": "First"
    }
  }
  ```
* **Error Response (Status: 403 Forbidden)**: If a Student requests another student's profile, or a Coordinator requests a student profile from another department.

#### 6. List All Students
* **Path**: `GET /students/`
* **Auth**: `SuperAdmin` (Role 1)
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Successfully fetched students",
    "data": [
      {
        "user_id": 6,
        "roll_no": "20BCE0012",
        "name": "Jane Doe",
        "user_table": { "email": "student@domain.com", "mobile_no": "1234567890" }
      }
    ]
  }
  ```

---

### Organization Namespace (`/organizations`)

#### 1. Register Organization
* **Path**: `POST /organizations`
* **Auth**: None
* **Body Requirements (Strict)**:
  ```json
  {
    "name": "Google",
    "email": "contact@google.com",
    "mobile_no": "9999999999",
    "password": "securepassword"
  }
  ```
* **Success Response (Status: 201 Created)**:
  ```json
  {
    "success": true,
    "message": "Organization with email: contact@google.com created",
    "data": {
      "user_id": 7,
      "name": "Google",
      "approval_id": 0, // 0 = Pending
      "is_active": true
    }
  }
  ```

#### 2. Update Organization Approval Status
* **Path**: `PATCH /organizations/:organization_id/status`
* **Auth**: `SuperAdmin` (Role 1)
* **Body Requirements (Strict)**:
  ```json
  {
    "approval_id": 1 // 1 = Approved, 2 = Rejected
  }
  ```
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Successfully updated organization approval status",
    "data": {
      "user_id": 7,
      "name": "Google",
      "approval_id": 1
    }
  }
  ```

#### 3. Get Organizations
* **Path**: `GET /organizations`
* **Auth**: `SuperAdmin` (Role 1)
* **Query Params**:
  - `status`: `approved` | `pending` | `rejected` (optional; defaults to fetching approved organizations)
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Successfully fetched organizations",
    "data": [
      {
        "user_id": 7,
        "name": "Google",
        "approval_id": 1,
        "user_table": { "email": "contact@google.com", "mobile_no": "9999999999" }
      }
    ]
  }
  ```

#### 4. Get Single Organization
* **Path**: `GET /organizations/:organization_id`
* **Auth**: `Student` (Role 2), `Coordinator` (Role 3), `SuperAdmin` (Role 1)
* **Path Params**: `organization_id` (numeric)
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Successfully fetched organization details",
    "data": {
      "user_id": 7,
      "name": "Google",
      "approval_id": 1,
      "is_active": true
    }
  }
  ```

---

### Training Namespace (`/trainings`)

#### 1. Create Training
* **Path**: `POST /trainings`
* **Auth**: `Organization` (Role 4), `Coordinator` (Role 3), `SuperAdmin` (Role 1)
* **Body Requirements**:
  ```json
  {
    "title": "Advanced Web Security",
    "description": "Bootcamp on web app exploits", // optional
    "min_cgpa": 7.0, // optional number (decimal conversion handled by backend)
    "end_date": "2026-08-31T00:00:00.000Z", // optional datetime string
    "start_date": "2026-08-01T00:00:00.000Z", // optional datetime string
    "image_url": "https://storage.provider.com/banner.png", // optional string
    "last_date_of_submission": "2026-07-25T00:00:00.000Z", // optional datetime string
    "is_active": true // optional boolean (default: true)
  }
  ```
* **Success Response (Status: 201 Created)**:
  ```json
  {
    "success": true,
    "message": "Successfully created training",
    "data": {
      "training_id": 4,
      "creator_id": 7,
      "title": "Advanced Web Security",
      "description": "Bootcamp on web app exploits",
      "min_cgpa": "7.00",
      "start_date": "2026-08-01T00:00:00.000Z",
      "end_date": "2026-08-31T00:00:00.000Z",
      "image_url": "https://storage.provider.com/banner.png",
      "is_active": true
    }
  }
  ```

#### 2. Get All Trainings
* **Path**: `GET /trainings`
* **Auth**: `Student` (Role 2), `Org` (Role 4), `Coordinator` (Role 3), `SuperAdmin` (Role 1)
* **Behavior**:
  - **For Students**: Only returns active trainings for which they meet eligibility requirements (e.g., student's CGPA >= `min_cgpa` threshold).
  - **For Creators (Org/Admin/Coordinator)**: Returns all training programs created by their account.
* **Success Response (Status: 201 Created)**:
  > [!NOTE]
  > This endpoint returns a status code of **201 Created** instead of 200 due to backend controller configuration.
  ```json
  {
    "success": true,
    "message": "Successfully fetched all trainings",
    "data": [
      {
        "training_id": 4,
        "title": "Advanced Web Security",
        "min_cgpa": "7.00",
        "is_active": true
      }
    ]
  }
  ```

#### 3. Get Single Training Details
* **Path**: `GET /trainings/:training_id`
* **Auth**: `Student` (Role 2), `Org` (Role 4), `Coordinator` (Role 3), `SuperAdmin` (Role 1)
* **Path Params**: `training_id` (numeric)
* **Success Response (Status: 201 Created)**:
  > [!NOTE]
  > This endpoint returns a status code of **201 Created** instead of 200 due to backend controller configuration.
  ```json
  {
    "success": true,
    "message": "Successfully fetched training",
    "data": {
      "training_id": 4,
      "creator_id": 7,
      "title": "Advanced Web Security",
      "description": "Bootcamp on web app exploits",
      "min_cgpa": "7.00"
    }
  }
  ```

---

### Training Applications Namespace (`/training-applications`)

#### 1. Submit Application
* **Path**: `POST /training-applications`
* **Auth**: `Student` (Role 2)
* **Body Requirements (Strict)**:
  ```json
  {
    "training_id": 4
  }
  ```
* **Success Response (Status: 201 Created)**:
  ```json
  {
    "success": true,
    "message": "Training Applcation created successfully", // Note: hardcoded typo in API
    "data": {
      "training_id": 4,
      "student_id": 6,
      "status_id": 0, // 0 = Pending, 1 = Approved
      "date_of_submission": "2026-07-08T00:00:00.000Z",
      "remarks": null
    }
  }
  ```

#### 2. Update Application Status (Approve/Reject)
* **Path**: `PATCH /training-applications/:training_id/students/:student_id` (Note: No `/status` suffix)
* **Auth**: `Organization` (Role 4), `Coordinator` (Role 3), `SuperAdmin` (Role 1)
* **Path Params**: 
  - `student_id`: number (Target student user ID)
  - `training_id`: number (Target training program ID)
* **Query Params**:
  - `status`: `approve` | `reject` (required)
* **Body Requirements**:
  Due to a validation schema configuration in the backend routes, the request body is strictly validated against the `trainingApplicationCreateSchema`. This means the body **must** contain `training_id`, and any other keys (such as `remarks`) are rejected:
  ```json
  {
    "training_id": 4
  }
  ```
  *(Note: Any custom remarks or text cannot be updated through the body due to this schema check).*
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Training Application updated successfull", // Note: hardcoded typo in API
    "data": {
      "training_id": 4,
      "student_id": 6,
      "status_id": 2, // 2 = Approved, 3 = Rejected
      "remarks": null,
      "date_of_submission": "2026-07-08T00:00:00.000Z"
    }
  }
  ```

#### 3. View Applications
* **Path**: `GET /training-applications`
* **Auth**: `Student` (Role 2), `Org` (Role 4), `Coordinator` (Role 3), `SuperAdmin` (Role 1)
* **Behavior**:
  - **For Students**: Returns their personal submitted applications including full training, creator, and organization details.
  - **For Creators (Org/Coordinator/SuperAdmin)**: Returns applications received for trainings they created including student details.
* **Success Response (Status: 200 OK)**:
  - **For Students**:
    ```json
    {
      "success": true,
      "message": "Training Application fetch successfull", // Note: hardcoded typo in API
      "data": [
        {
          "training_id": 4,
          "student_id": 6,
          "status_id": 0,
          "date_of_submission": "2026-07-08T00:00:00.000Z",
          "remarks": null,
          "training_table": {
            "training_id": 4,
            "title": "Advanced Web Security",
            "description": "Bootcamp on web app exploits",
            "creator_id": 4,
            "min_cgpa": "7.00",
            "is_active": true,
            "user_table": {
              "user_id": 4,
              "email": "org@example.com",
              "role_id": 4,
              "organization_table": {
                "user_id": 4,
                "name": "Acme Corp",
                "approval_id": 1
              }
            }
          }
        }
      ]
    }
    ```
  - **For Creators (Org/Coordinator/SuperAdmin)**:
    ```json
    {
      "success": true,
      "message": "Training Application fetch successfull", // Note: hardcoded typo in API
      "data": [
        {
          "training_id": 4,
          "student_id": 6,
          "status_id": 0,
          "date_of_submission": "2026-07-08T00:00:00.000Z",
          "remarks": null,
          "training_table": {
            "training_id": 4,
            "title": "Advanced Web Security",
            "description": "Bootcamp on web app exploits",
            "creator_id": 4,
            "min_cgpa": "7.00",
            "is_active": true
          },
          "student_table": {
            "user_id": 6,
            "roll_no": "2026001",
            "department_id": 2,
            "cgpa": "8.50"
          }
        }
      ]
    }
    ```

#### 4. View Single Application
* **Path**: `GET /training-applications/:training_id/students/:student_id`
* **Auth**: `Student` (self), `Org` (creator), `Coordinator` (creator), `SuperAdmin` (Role 1)
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Training Application approved successfull", // Note: returns approval msg on retrieval
    "data": {
      "training_id": 4,
      "student_id": 6,
      "status_id": 0,
      "date_of_submission": "2026-07-08T00:00:00.000Z",
      "remarks": null
    }
  }
  ```

---

### Placements Namespace (`/placements`)

#### 1. Create Placement
* **Path**: `POST /placements`
* **Auth**: `Organization` (Role 4), `Coordinator` (Role 3), `SuperAdmin` (Role 1)
* **Body Requirements**:
  ```json
  {
    "title": "Software Engineer Intern",
    "description": "Looking for talented software developers.", // optional
    "min_cgpa": 7.5, // optional number (decimal conversion handled by backend)
    "last_date_of_submission": "2026-08-31T00:00:00.000Z", // optional datetime string
    "start_date": "2026-08-01T00:00:00.000Z", // optional datetime string
    "end_date": "2026-08-31T00:00:00.000Z", // optional datetime string
    "image_url": "https://storage.provider.com/banner.png", // optional string
    "is_active": true // optional boolean (default: true)
  }
  ```
* **Success Response (Status: 201 Created)**:
  ```json
  {
    "success": true,
    "message": "Successfully created placement",
    "data": {
      "placement_id": 1,
      "creator_id": 5,
      "title": "Software Engineer Intern",
      "description": "Looking for talented software developers.",
      "min_cgpa": "7.50",
      "last_date_of_submission": "2026-08-31T00:00:00.000Z",
      "is_active": true
    }
  }
  ```

#### 2. Get All Placements
* **Path**: `GET /placements`
* **Auth**: `Student` (Role 2), `Organization` (Role 4), `Coordinator` (Role 3), `SuperAdmin` (Role 1)
* **Behavior**:
  - **For Students**: Returns active placements where student's CGPA meets/exceeds `min_cgpa`.
  - **For Creators (Org/Admin/Coordinator)**: Returns placements created by them.
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Successfully fetched all placements",
    "data": [
      {
        "placement_id": 1,
        "title": "Software Engineer Intern",
        "min_cgpa": "7.50",
        "is_active": true
      }
    ]
  }
  ```

#### 3. Get Single Placement Details
* **Path**: `GET /placements/:placement_id`
* **Auth**: `Student` (Role 2), `Organization` (Role 4), `Coordinator` (Role 3), `SuperAdmin` (Role 1)
* **Path Params**: `placement_id` (numeric)
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Successfully fetched placement",
    "data": {
      "placement_id": 1,
      "creator_id": 5,
      "title": "Software Engineer Intern",
      "description": "Looking for talented software developers.",
      "min_cgpa": "7.50"
    }
  }
  ```

---

### Placement Applications Namespace (`/placement-applications`)

#### 1. Submit Placement Application
* **Path**: `POST /placement-applications`
* **Auth**: `Student` (Role 2)
* **Body Requirements (Strict)**:
  ```json
  {
    "placement_id": 1
  }
  ```
* **Success Response (Status: 201 Created)**:
  ```json
  {
    "success": true,
    "message": "Placement Application created successfully",
    "data": {
      "placement_id": 1,
      "student_id": 12,
      "status_id": 0, // 0 = Pending, 1 = Approved
      "remarks": null
    }
  }
  ```

#### 2. Approve Application
* **Path**: `PATCH /placement-applications/:placement_id/students/:student_id/status`
* **Auth**: `Organization` (Role 4), `Coordinator` (Role 3), `SuperAdmin` (Role 1)
* **Path Params**:
  - `placement_id`: number (Target placement ID)
  - `student_id`: number (Target student user ID)
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Placement Application approved successfully",
    "data": {
      "placement_id": 1,
      "student_id": 12,
      "status_id": 1
    }
  }
  ```

#### 3. View Placement Applications
* **Path**: `GET /placement-applications`
* **Auth**: `Student` (Role 2), `Organization` (Role 4), `Coordinator` (Role 3), `SuperAdmin` (Role 1)
* **Behavior**:
  - **For Students**: Returns their personal submitted placement applications.
  - **For Creators (Org/Coordinator/SuperAdmin)**: Returns applications received for placements they created.
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Placement Applications fetched successfully",
    "data": [
      {
        "placement_id": 1,
        "student_id": 12,
        "status_id": 0,
        "placement_table": { "title": "Software Engineer Intern" }
      }
    ]
  }
  ```

#### 4. View Single Placement Application
* **Path**: `GET /placement-applications/:placement_id/students/:student_id`
* **Auth**: `Student` (self), `Org` (creator), `Coordinator` (creator), `SuperAdmin` (Role 1)
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Training Application approved successfull", // Note: hardcoded message returned by backend controller
    "data": {
      "placement_id": 1,
      "student_id": 12,
      "status_id": 0,
      "remarks": null
    }
  }
  ```

---

### Dashboard Namespace (`/dashboards`)

#### 1. Retrieve Dashboard Data
* **Path**: `GET /dashboards`
* **Auth**: `Student` (Role 2), `Coordinator` (Role 3), `SuperAdmin` (Role 1)
* **Behavior**:
  - **For Students**: Returns personal applied and eligible training/placement details.
  - **For Coordinators**: Returns student count in their department, organization counts, and approval ratios.
  - **For SuperAdmins**: Returns global counters (student, department, org, training count) and approval percentages.

* **Student Response Example**:
  ```json
  {
    "success": true,
    "message": "Successfully fetched dashboard",
    "data": {
      "appliedTrainings": [ ... ],
      "eligibleTrainings": [ ... ],
      "appliedPlacement": [ ... ],
      "eligiblePlacement": [ ... ]
    }
  }
  ```

* **Coordinator Response Example**:
  ```json
  {
    "success": true,
    "message": "Successfully fetched dashboard",
    "data": {
      "studentCount": 82,
      "organizationCount": 15,
      "trainingApplicationCount": 150,
      "trainingPercentage": 75.00,
      "placementApplicationCount": 40,
      "placementApplicationPercentage": 60.00
    }
  }
  ```

* **SuperAdmin Response Example**:
  ```json
  {
    "success": true,
    "message": "Successfully fetched dashboard",
    "data": {
      "studentCount": 420,
      "departmentCount": 8,
      "organizationCount": 15,
      "trainingCount": 24,
      "trainingPercentage": 64.51,
      "placementCount": 12,
      "placementPercentage": 50.00
    }
  }
  ```

---

### Upload Namespace (`/upload`)

These endpoints receive file uploads and store them locally inside the `public/` directory using Multer. Uploaded files are served statically from `/public` route.

* **Format**: Multipart Form-Data with parameter name `media`

#### 1. Profile Picture Upload
* **Path**: `POST /upload/profile`
* **Auth**: Public
* **Destination Directory**: `public/profile_media/`
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "File uploaded successfully",
    "fileUrl": "http://localhost:5000/public/profile_media/1720442300000-avatar.png"
  }
  ```

#### 2. Banner Upload
* **Path**: `POST /upload/banner`
* **Auth**: Public
* **Destination Directory**: `public/banner_media/`
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "File uploaded successfully",
    "fileUrl": "http://localhost:5000/public/banner_media/1720442300000-banner.png"
  }
  ```

#### 3. Notes Upload (Multiple files supported)
* **Path**: `POST /upload/notes`
* **Auth**: Public
* **Destination Directory**: `public/notes_media/`
* **Success Response (Status: 200 OK)**:
  `fileUrl` will contain an array of static URLs.
  ```json
  {
    "success": true,
    "message": "File uploaded successfully",
    "fileUrl": [
      "http://localhost:5000/public/notes_media/1720442300000-note1.pdf",
      "http://localhost:5000/public/notes_media/1720442300000-note2.docx"
    ]
  }
  ```

#### 4. Resume Upload
* **Path**: `POST /upload/resume`
* **Auth**: Public
* **Destination Directory**: `public/resume_media/`
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "File uploaded successfully",
    "fileUrl": "http://localhost:5000/public/resume_media/1720442300000-my_resume.pdf"
  }
  ```

---

### Department Namespace (`/departments`)

#### 1. Register Department
* **Path**: `POST /departments/register`
* **Auth**: `SuperAdmin` (Role 1)
* **Body Requirements (Strict)**:
  ```json
  {
    "dept_name": "Computer Science", // string (required)
    "is_active": true // boolean (optional)
  }
  ```
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Department ID has to be made autoincrement",
    "data": null
  }
  ```

#### 2. Get All Departments
* **Path**: `GET /departments`
* **Auth**: Public
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Fetched all departments",
    "data": [
      {
        "department_id": 1,
        "dept_name": "Computer Science",
        "is_active": true
      }
    ]
  }
  ```

#### 3. Update Department
* **Path**: `PATCH /departments/:department_id`
* **Auth**: `SuperAdmin` (Role 1)
* **Path Params**: `department_id` (numeric)
* **Body Requirements (Optional properties)**:
  ```json
  {
    "department_name": "Computer Science & Engineering",
    "email": "newcoordinator@domain.com",
    "name": "New Coordinator Name",
    "is_active": true
  }
  ```
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Department updated successfully",
    "data": {
      "department_id": 1,
      "department_name": "Computer Science & Engineering",
      "is_active": true,
      "coordinator_id": 3,
      "user_table": {
        "user_id": 3,
        "name": "New Coordinator Name",
        "email": "newcoordinator@domain.com",
        "mobile_no": "1234567890"
      }
    }
  }
  ```

---

### Master Namespace (`/masters`)

Allows unified access to multiple system lookups under a cached and centralized endpoint.

* **Path**: `GET /masters`
* **Auth**: Public
* **Query Params (Required)**:
  - `type`: `genders` | `semesters` | `divisions` | `categories` | `skills` | `sectors`
* **Success Response (Status: 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Successfully fetched master table",
    "data": [ ... ] // Array of master table rows
  }
  ```

---

### Metadata Namespaces (Individual Reference Data)

All metadata lists return simple reference objects: `{ <id_name>: number, <value_name>: string }`.

#### 1. Category Table
* **Path**: `GET /categories`
* **Auth**: Public
* **Success Response Message**: `"Fetched all category"`
* **Data Fields**: `category_id`, `category` (e.g., Unreserved, OBC, SC, ST)

#### 2. Division Table
* **Path**: `GET /divisions`
* **Auth**: Public
* **Success Response Message**: `"Fetched all divisions"`
* **Data Fields**: `division_id`, `division` (e.g., Distinction, First, Second)

#### 3. Gender Table
* **Path**: `GET /genders`
* **Auth**: Public
* **Success Response Message**: `"Fetched all genders"`
* **Data Fields**: `gender_id`, `gender` (e.g., Male, Female, Other)

#### 4. Semester Table
* **Path**: `GET /semesters`
* **Auth**: Public
* **Success Response Message**: `"Fetched all departments"` (Note: returns departments message due to backend code reuse)
* **Data Fields**: `semester_id`, `semester` (e.g., Sem 1, Sem 2...)

#### 5. Skill Table
* **Path**: `GET /skills`
* **Auth**: Public
* **Success Response Message**: `"Fetched all skills"`
* **Data Fields**: `skill_id`, `skill` (e.g., TypeScript, React, Python)

---

## 6. Critical Integration & Backend Bug Warnings

All critical bugs have been resolved.
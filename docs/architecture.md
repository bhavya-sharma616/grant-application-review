# Architecture

## What are the moving pieces, and how do they talk to each other?

The system is split into three main parts:

- A React frontend
- A Node.js and Express backend
- A MongoDB database

The frontend is responsible for the user interface. It contains pages for login, the dashboard, applications, application details, and archived applications. React Router handles navigation between pages, and Axios is used to send HTTP requests to the backend API.

The backend exposes REST API endpoints and contains the application's main business logic. Express routes receive incoming requests, middleware handles authentication and role-based authorization, controllers process requests and apply business rules, and Mongoose models communicate with MongoDB.

MongoDB stores the application's persistent data, including users, grant applications, reviewer assignments, reviews, and conflicts of interest.

The frontend does not directly communicate with the database. All requests go through the backend API.

The overall communication flow is:

```text
React Frontend
      ↓
Axios HTTP Request
      ↓
Express Route
      ↓
Authentication Middleware
      ↓
Role Authorization Middleware
      ↓
Controller / Business Logic
      ↓
Mongoose Model
      ↓
MongoDB
      ↓
JSON Response
      ↓
React UI Update
```

The frontend is also responsible for presenting role-specific interfaces to users. However, permissions are not enforced only in the interface. The backend verifies the authenticated user and their role before allowing protected actions.

---

## Where does each piece run?

During development, the frontend and backend run as separate applications.

### Frontend

The React frontend runs in the user's browser and is served during development using Vite.

The frontend is located in the `client/` directory. Its main structure includes:

- `src/pages/` for application screens
- `src/components/` for reusable UI components
- `src/services/` for API communication
- `App.jsx` for application routing
- `main.jsx` as the frontend entry point

### Backend

The backend runs as a Node.js application using Express.

It is located in the `server/` directory and is organised into:

- `controllers/` for request handling and business logic
- `middleware/` for authentication and authorization
- `models/` for Mongoose database models
- `routes/` for API endpoints
- `index.js` as the server entry point

### Database

MongoDB runs separately from both the frontend and backend.

The Express backend connects to MongoDB through Mongoose. The database is not exposed directly to the frontend.

The development architecture can be represented as:

```text
Browser
   │
   ▼
React + Vite Frontend
   │
   │ HTTP / REST API Requests
   ▼
Node.js + Express Backend
   │
   │ Mongoose
   ▼
MongoDB Database
```

---

## What is the request path for one representative user action, end to end?

One representative user action is archiving a grant application.

A Program Officer opens an application's details page and chooses to archive the application.

### Step 1: User action

The Program Officer clicks the Archive action on the application details page.

### Step 2: Frontend request

The React frontend sends a `PATCH` request to the application's archive endpoint.

The user's JWT is included in the request's Authorization header so that the backend can identify the authenticated user.

### Step 3: Express route

The request reaches the appropriate Express route.

The archive endpoint is protected and only allows authorised Program Officers to perform the action.

### Step 4: Authentication middleware

Authentication middleware verifies the JWT and identifies the logged-in user.

If the token is invalid or missing, the request is rejected.

### Step 5: Role authorization

Role-based middleware checks whether the authenticated user has the `PROGRAM_OFFICER` role.

If the user does not have permission, the backend rejects the request.

### Step 6: Controller and business logic

The `archiveApplication` controller receives the request.

It finds the requested grant application and updates:

- `isArchived` to `true`
- `archivedAt` to the current date and time

### Step 7: Database update

Mongoose saves the updated Grant Application document in MongoDB.

The application is not deleted. Its data and associated records remain available.

### Step 8: Backend response

The backend returns a JSON response confirming that the application was archived successfully.

### Step 9: Frontend update

The React frontend receives the response and updates the user interface.

The archived application no longer appears in the default active applications list. It can instead be viewed on the Archived Applications page and restored later if required.

The complete request path is:

```text
Program Officer clicks Archive
        ↓
React Application Details Page
        ↓
Axios PATCH Request
        ↓
Express Application Route
        ↓
Authentication Middleware
        ↓
PROGRAM_OFFICER Authorization
        ↓
archiveApplication Controller
        ↓
GrantApplication Mongoose Model
        ↓
MongoDB Update
        ↓
JSON Response
        ↓
React UI Updates
```

---

## What did you decide *not* to build, and why?

The application was built incrementally within the assignment's time budget. I prioritised the core application architecture and then implemented the reviewer workflow on top of the application-management foundation.

The implemented workflow now includes:

* Reviewer assignment and due dates
* Active assignment limits
* Review draft creation and editing
* Review completion and scoring
* Conflict-of-interest declarations
* Automatic deactivation of an assignment after a conflict is declared
* Preventing a conflicted reviewer from being assigned to the same application again
* Application history and audit events
* Bulk reviewer assignment
* CSV export of completed reviews
* Application status lifecycle validation
* Requiring at least three completed reviews before an application can be marked as `DECIDED`

Optional stretch features were intentionally left out to keep the scope focused on the required workflow. These include:

* Applicant-facing application portal
* Reviewer calibration reports
* Configurable scoring rubrics
* Public funded-project listings
* Automatic reviewer matching
* Applicant appeals process
* Budget tracking against funding pools
* Email notifications
* Application anonymisation

The backend remains organised into separate routes, controllers, middleware, and models so that additional features can be added without requiring a major restructuring of the application.

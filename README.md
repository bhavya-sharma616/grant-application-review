# Grant Application Review

A full-stack application for managing grant applications and supporting a structured grant review workflow.

The system uses role-based access for Program Officers and Reviewers and provides a foundation for managing applications, assignments, reviews, conflicts of interest, and funding decisions.

---

## Features

### Application Management

- Create grant applications
- View application details
- Edit grant applications
- Archive applications without deleting their records
- Restore archived applications
- View active and archived applications separately

### Finding Applications

- Search by applicant organization name
- Search by contact email
- Filter by funding round
- Filter by application status
- Sort by submission date
- Sort by amount requested
- Sort by status
- Server-side pagination

### Access Control

- User authentication
- Program Officer and Reviewer roles
- Server-side role-based authorization
- Protected backend routes

### Application Data

Each application includes:

- Applicant organization name
- Contact email
- Funding round
- Exact requested amount using MongoDB `Decimal128`
- Submission date
- Owning Program Officer
- Application status
- Archive state

Supported application statuses:

- `SUBMITTED`
- `ASSIGNED`
- `UNDER_REVIEW`
- `DECIDED`

### Reviewer Workflow Foundation

The project includes data models for:

- Reviewer assignments
- Reviews
- Conflict of interest declarations

Reviews support three scoring criteria:

- Impact
- Feasibility
- Budget Justification

Review records also include comments and support `DRAFT` and `COMPLETED` states.

---

## Tech Stack

### Frontend

- React
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

---

## Application Roles

### Program Officer

Program Officers manage grant applications through protected backend routes.

Current application-management functionality includes:

- Creating applications
- Editing applications
- Archiving applications
- Restoring applications

### Reviewer

The application supports a separate Reviewer role and reviewer-specific data relationships for assignments, reviews, and conflicts.

---

## Project Structure

```text
grant-application-review/
├── client/                 # React frontend
│   └── src/
│       ├── components/
│       └── pages/
│
├── server/                 # Express backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
│
├── docs/                   # Project documentation
│   ├── architecture.md
│   ├── schema.md
│   ├── plan.md
│   ├── decisions.md
│   └── ai-prompts.md
│
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB, or access to a MongoDB database

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
npm run dev
```

### Frontend Setup

Open another terminal and run:

```bash
cd client
npm install
npm run dev
```

The frontend runs locally and communicates with the Express API.

---

## API Configuration

During local development, the frontend uses:

```text
http://localhost:5000/api
```

The backend handles database access, authentication, authorization, and application-related business logic.

---

## Documentation

Additional project documentation is available in the `docs/` directory:

- `docs/architecture.md` — system architecture and request flow
- `docs/schema.md` — collections, relationships, and constraints
- `docs/plan.md` — development sessions and implementation order
- `docs/decisions.md` — technical decisions and trade-offs
- `docs/ai-prompts.md` — AI assistance used during development

---

## Current Development Status

The core application-management workflow is implemented, including:

- Application creation
- Application listing
- Application details
- Editing applications
- Search and filtering
- Sorting
- Server-side pagination
- Archiving
- Restoring archived applications

The project also includes the foundational data models for reviewer assignments, reviews, and conflicts.

Additional reviewer workflows, workflow validation, history, alerts, bulk operations, and deployment can be added on top of the existing application structure.

---

## Security Notes

Sensitive values such as database connection strings and JWT secrets should be stored in environment variables and should not be committed to the repository.

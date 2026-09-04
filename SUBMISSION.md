# Submission

## Links

- **GitHub repository:** https://github.com/bhavya-sharma616/grant-application-review
- **Live application:** https://grant-application-review-dun.vercel.app/

## Notes for the reviewer

The frontend is deployed on Vercel and the backend/API is deployed on Render. The first backend request may take a little longer if the service is idle.

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Program Officer | officer@example.com | temporary-password |
| Reviewer 1 | reviewer1@example.com | temporary-password |
| Reviewer 2 | reviewer2@example.com | temporary-password |
| Reviewer 3 | reviewer3@example.com | temporary-password |

## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| Frontend | React + Vite | Component-based frontend with fast development/build tooling |
| Backend | Node.js + Express | REST API and server-side workflow logic |
| Database | MongoDB + Mongoose | Persistent application, reviewer, assignment, review, history, conflict, and alert data |
| Hosting | Vercel + Render | Separate frontend and backend deployment |

## Goal checklist

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Reviewer assignment workflow | Done | Program Officers can assign multiple reviewers with due dates; assignment limits and conflict checks are enforced. |
| 2 | Reviewer decline and conflict handling | Done | Reviewers can decline assignments with a reason and declare conflicts of interest. |
| 3 | Server-side application list controls | Done | Search, filtering, sorting, pagination, owner filtering, and overdue filtering are server-side. |
| 4 | Bulk assignment and CSV export | Done | Bulk reviewer assignment and completed-review CSV export are implemented. |
| 5 | Dashboard | Done | Dashboard includes headline metrics, status/funding-round summaries, and decisions per week. |
| 6 | Immutable history | Done | Application history records creation, status changes, assignments/removals, comments, conflicts, completed reviews, and declined assignments. |
| 7 | Overdue alerts | Done | Overdue assignments appear in PO alerts; dismissal is supported and alerts can reappear after a revised due date becomes overdue. |
| 8 | Review workflow and status lifecycle | Done | Review drafts/completions and server-side status transition rules are implemented. |
| 9 | Required project documentation | Done | Architecture, schema, plan, decisions, and AI-prompts documentation are included. |
| 10 | Deployment and submission | Done | Frontend and backend are deployed and demo credentials are provided above. |

## How much time did you actually spend?

Approximately 12 hours.

## What would you do next, with another 12 hours?

I would add broader automated test coverage, exercise more edge cases around reviewer assignments and status transitions, and make targeted performance improvements based on deployed usage.

## What are you least happy with in this codebase, and why?

The main area I would improve is automated test coverage. The core workflows are implemented, but more integration and edge-case tests would make future changes safer and give stronger confidence in the reviewer assignment, status, alert, and history workflows.

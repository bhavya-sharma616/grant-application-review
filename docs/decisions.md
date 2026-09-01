# Decisions

This document records decisions that actually shaped the Grant Application Review codebase. Each decision involved a real alternative and a trade-off.

## Decision 1

- **Chose:** A separate React frontend and Node.js/Express backend communicating through a REST API.

- **Rejected:** A more tightly coupled application structure where frontend and backend concerns were handled together.

- **Why:** The assignment requires server-side authentication and role enforcement. Separating the frontend from the backend made responsibilities clearer: React handles the UI, Express handles business rules and authorization, and MongoDB stores the data. It also ensures the frontend never communicates directly with the database.

## Decision 2

- **Chose:** Server-side role-based authorization using authentication middleware and `allowRoles` middleware.

- **Rejected:** Relying only on hiding buttons, links, or pages in the React frontend.

- **Why:** Frontend restrictions alone can be bypassed by directly calling an API endpoint. Program Officer permissions therefore need to be checked on the server before protected actions such as creating, editing, archiving, or restoring applications are allowed.

## Decision 3

- **Chose:** MongoDB `Decimal128` for the `amountRequested` field.

- **Rejected:** A normal JavaScript `Number` for grant amounts.

- **Why:** Grant amounts are financial values and the assignment specifically asks for an exact decimal amount. Floating-point numbers can introduce precision problems, while `Decimal128` is better suited to storing exact decimal values.

## Decision 4

- **Chose:** Soft archiving applications using `isArchived` and `archivedAt`.

- **Rejected:** Permanently deleting applications from the database.

- **Why:** The assignment requires archived applications to disappear from normal views without destroying their associated information. Soft archiving preserves the application and allows it to be restored later.

## Decision 5

- **Chose:** Separate collections for `Assignment`, `Review`, and `Conflict`, with ObjectId references to the related application and user.

- **Rejected:** Embedding all reviewer assignments, reviews, and conflicts directly inside the Grant Application document.

- **Why:** These records can be queried independently and can grow over time. Keeping them separate makes the relationships easier to manage and allows compound unique indexes to protect against duplicate records.

## Decision 6

- **Chose:** Compound unique indexes on `application + reviewer` for assignments, reviews, and conflicts.

- **Rejected:** Checking for duplicates only in controller code before creating a record.

- **Why:** Controller checks can provide useful error messages, but database-level uniqueness gives an additional guarantee that duplicate reviewer/application relationships cannot be stored, including in edge cases involving multiple requests.

## Decision 7

- **Chose:** Server-side searching, filtering, sorting, and pagination for the applications list.

- **Rejected:** Loading all applications into the browser and filtering or sorting them in React.

- **Why:** The assignment explicitly requires these operations to happen on the server. This also means the browser only receives the data needed for the current page rather than the entire application dataset.

## Decision 8

- **Chose:** Build the core application-management workflow before the more complex reviewer workflows.

- **Rejected:** Trying to build all required features simultaneously.

- **Why:** Applications are the central data model that assignments, reviews, conflicts, status changes, alerts, and history depend on. Building application creation, listing, details, editing, archiving, and restoration first created a stable base for the remaining features.

## Decision 9

- **Chose:** Rename the navigation area from `History` to `Archived` for the page that displays archived applications.

- **Rejected:** Keeping the name `History` for archived applications.

- **Why:** The assignment defines application history as an immutable timeline of events. Archived applications are not the same thing as an audit timeline, so `Archived` is a more accurate name for the functionality currently shown.

- **Later reversed:** The original navigation used the name `History`. While building the archive workflow, I realised that the label was misleading because archiving is different from the required immutable event history. I changed the direction to use `Archived` and kept the future timeline/history feature conceptually separate.

## Decision 10

- **Chose:** Keep structural validation and simple data constraints in Mongoose schemas, while keeping cross-document workflow rules in controllers.

- **Rejected:** Trying to enforce every business rule directly in the schema.

- **Why:** Required fields, enum values, score ranges, and unique indexes fit naturally at the schema/database level. Rules such as checking active assignment limits, conflicts of interest, valid status transitions, and the number of completed reviews require querying multiple documents, so they belong in application business logic.

---

## Decision 11: Handle conflicts by deactivating the reviewer assignment

### What I chose

When a reviewer declares a conflict of interest for an application, the system records the conflict and immediately deactivates that reviewer's active assignment.

### Why

A reviewer who has declared a conflict should no longer be able to review the application. Deactivating the assignment removes the application from the reviewer's active workload while preserving the assignment record for audit purposes.

### Reassignment behaviour

The conflict record remains associated with the application and reviewer. When the Program Officer attempts to assign a reviewer, the backend checks for an existing conflict before creating the assignment.

This prevents a reviewer who previously declared a conflict for an application from being assigned to the same application again.

### Audit trail

The conflict declaration is also recorded in the application history with the conflict reason. This allows the Program Officer to see that the reviewer withdrew because of a conflict and provides an audit trail of the workflow.

---

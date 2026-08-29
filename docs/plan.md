# Plan

This project was planned as a series of small development sessions. The main goal was to build the core system first, test each part as it was added, and avoid trying to implement all ten requirements at the same time.

The time estimates below were used as a guide rather than a strict schedule.

---

## Session 1: Project setup and authentication

### Planned work

- Understand the assignment requirements
- Inspect the starter repository structure
- Set up the frontend and backend
- Connect the backend to MongoDB
- Implement user authentication
- Add Program Officer and Reviewer roles

### Why this came first

Authentication and roles affect almost every other feature in the application. The backend needs to know who is making a request before it can decide whether that person is allowed to create applications, manage assignments, or review an application.

Building this first also made it possible to test later features using different roles.

### Estimated time

Approximately 2 hours.

### Actual time

Approximately 2 hours.

---

## Session 2: Application data model and backend CRUD

### Planned work

- Create the Grant Application Mongoose model
- Add required fields
- Use `Decimal128` for exact requested amounts
- Add application status values
- Implement application creation
- Implement application details
- Implement application editing
- Implement archive and restore functionality
- Protect Program Officer actions with server-side role checks

### Why this came next

Grant applications are the central entity in the system. Assignments, reviews, conflicts, alerts, and history all depend on having an application model.

I wanted a stable application-management workflow before building features that depend on it.

### Estimated time

Approximately 2 hours.

### Actual time

Approximately 2 to 2.5 hours.

### Notes

Some additional time was spent debugging backend model and route issues while integrating the new functionality.

---

## Session 3: Applications list and frontend integration

### Planned work

- Connect the React frontend to the applications API
- Build the applications list
- Add search
- Add funding round filtering
- Add status filtering
- Add sorting
- Add pagination
- Ensure filtering and pagination happen on the server

### Why this came next

Once applications could be created and stored, the next priority was making them easy to find and manage.

The assignment specifically requires search, filtering, sorting, and pagination to happen on the server, so this was implemented through query parameters rather than loading every application into the browser.

### Estimated time

Approximately 2 hours.

### Actual time

Approximately 2 to 3 hours.

### Notes

The frontend required some debugging while connecting state, filters, sorting values, and API responses.

---

## Session 4: Application details and archive workflow

### Planned work

- Build the application details page
- Display application information
- Add editing
- Add archive functionality
- Add an archived applications page
- Add restore functionality
- Improve navigation between application views

### Why this came next

The list page provides an overview, but Program Officers also need a focused view for managing individual applications.

Archiving was prioritised because it is part of the required application lifecycle and because archived applications need to be hidden without being deleted.

### Estimated time

Approximately 1.5 hours.

### Actual time

Approximately 2 hours.

### Notes

Part of this session was spent improving the placement and appearance of actions such as Edit and Archive so that the interface was clearer and easier to use.

---

## Session 5: Reviewer models and workflow foundation

### Planned work

- Create the Assignment model
- Create the Review model
- Create the Conflict model
- Add reviewer/application relationships
- Add compound unique indexes
- Prepare the backend structure for reviewer-specific workflows

### Why this came next

Reviewer assignments and reviews depend on both the application and user models already existing.

Creating the data models first provides a foundation for implementing:

- Reviewer assignments
- Review scores
- Draft and completed reviews
- Conflict declarations
- Assignment limits

### Estimated time

Approximately 2 hours.

### Actual time

Approximately 1.5 to 2 hours.

---

## Session 6: Dashboard and application polish

### Planned work

- Build the dashboard interface
- Show headline metrics
- Show applications by status
- Show applications by funding round
- Improve navigation and page layout
- Check Program Officer application flows

### Why this came later

The dashboard depends on data from the application's other workflows, so it made more sense to build the core pages before focusing on the overview interface.

The dashboard UI was created as a useful overview while backend-driven statistics can continue to be integrated with the remaining workflows.

### Estimated time

Approximately 1 to 1.5 hours.

### Actual time

Approximately 1.5 hours.

---

## Session 7: Documentation and final review

### Planned work

- Write architecture documentation
- Write schema documentation
- Record implementation decisions
- Record the development plan
- Document AI prompts used during development
- Prepare the README
- Prepare `SUBMISSION.md`
- Review the repository and commit history

### Why this was planned near the end

The documentation needed to describe the system that actually exists rather than an early plan that might no longer match the codebase.

The decisions document was also easier to write after several technical choices and changes had actually been made.

### Estimated time

Approximately 1 to 1.5 hours.

### Actual time

Approximately 1.5 to 2 hours.

---

# Planned order and why

The overall order was:

1. Project setup and authentication
2. Application data model and backend CRUD
3. Applications list and server-side querying
4. Application details, editing, archiving, and restoration
5. Reviewer-related data models
6. Dashboard and UI improvements
7. Documentation and final review

The main reasoning behind this order was dependency.

Authentication comes first because protected actions need a known user and role.

Applications come next because assignments, reviews, conflicts, and decisions all depend on an application existing.

The application list and details pages come before more advanced workflows because they provide the main interface for Program Officers to manage applications.

Reviewer-related models can then build on top of the application and user data.

Finally, the dashboard and documentation are easier to complete once the application's main structure is established.

---

# What took longer than expected

Frontend integration and debugging took longer than the initial estimates.

Examples included:

- React state errors
- Variable initialization errors
- Sorting state issues
- Connecting filters to server-side query parameters
- Backend model loading issues
- Adjusting the UI after seeing how the pages actually looked in the browser

This reinforced the decision to work incrementally and test features as they were added.

---

# What was cut or deferred

The assignment contains several complex workflows that require additional time and testing.

The following areas were deferred or remain to be completed while prioritising the core application-management workflow:

- Full reviewer assignment management
- Enforcing the maximum of five active assignments
- Due-date updates and overdue assignment calculations
- Full review draft and completion workflow
- Preventing completed reviews from being edited
- Full conflict-of-interest workflow integration with assignment blocking
- Complete status lifecycle validation
- Requiring three completed reviews before a decision
- Bulk reviewer assignment with a per-assignment result report
- CSV export of completed reviews
- Immutable application history timeline
- Overdue review alerts and dismissal behaviour
- Complete live dashboard aggregation
- Production deployment

I deliberately did not spend time on the optional stretch features because the required functionality was the priority.

The features that were cut or deferred were not removed because they were considered unimportant. They were deferred because several of them depend on the core models and workflows already implemented, and implementing them properly would require additional backend validation and testing.

---

# Final reflection on the plan

The plan worked best when development followed dependencies rather than trying to follow the assignment requirements in numerical order.

Building the application-management foundation first made the codebase easier to extend.

The biggest adjustment during development was recognising that frontend integration and debugging take meaningful time. A feature can be complete on the backend but still require additional work to make state, API calls, loading behaviour, and the UI work together correctly.

If continuing the project, the next sessions would focus on completing the reviewer assignment and review workflows first, then adding the status lifecycle rules, history timeline, alerts, bulk operations, and final deployment.

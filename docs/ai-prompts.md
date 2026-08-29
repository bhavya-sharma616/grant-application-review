# AI prompts

## Debugging the Applications page

### Prompt

I was getting:

`Cannot access 'fundingRound' before initialization`

in my `Applications.jsx` component. Help me understand what is causing this and what I should check.

### What you got

AI explained that the error usually happens when a variable is referenced before it has been initialized and pointed me toward checking the order of declarations and references in the component.

### What you corrected

I reviewed the component and corrected the variable/state usage order.

---

## Adding sorting to the Applications page

### Prompt

My `Applications.jsx` component is throwing:

`ReferenceError: sort is not defined`

I recently added sorting. Help me identify what is missing.

### What you got

AI suggested checking the sorting state and making sure the value used in the API request was actually defined.

### What you corrected

I corrected the sorting state and connected it properly to the API query.

---

## Debugging the Assignment model

### Prompt

I am getting:

`OverwriteModelError: Cannot overwrite 'Assignment' model once compiled`

in my Mongoose project. What is causing this?

### What you got

AI explained that this happens when Mongoose tries to compile the same model more than once and suggested checking model definitions and imports.

### What you corrected

I reviewed the Assignment model and how it was being imported so that the model was not being incorrectly compiled again.


---

## Generating project documentation

### Prompt

Based on my current grant application review project, help me structure the required architecture, schema, decisions, and plan documentation.

### What you got

AI provided structured drafts based on the code and models I shared.

### What you corrected

I checked the generated documentation against the assignment requirements and adjusted the structure so each required question was clearly answered.

---

## Reviewing application listing functionality

### Prompt

I need search, filters, sorting, and pagination for my applications list. The assignment requires this to happen on the server. Help me structure the backend query.

### What you got

AI suggested using query parameters and building the MongoDB query on the server.

### What you corrected

I integrated the approach with my existing controller and frontend state rather than copying a completely separate implementation.
# Assignment 19 — Grant Application Review

## The scenario

Picture a philanthropic foundation that runs a handful of grant funding rounds a year, each drawing
a couple hundred applications from nonprofits and community groups asking for money to run a
project. Right now the whole process lives across email and a shared spreadsheet: a coordinator
forwards applications to whichever staff member has time, that person leans on a few colleagues to
look them over, and someone eventually tallies opinions by hand before the foundation's leadership
signs off on who gets funded.

The result is predictable. A reviewer who sits on the board of an applicant organization ends up
scoring that application anyway, because nobody thought to check for a conflict before assigning it.
A funding decision goes out before a second opinion ever comes in, and afterward nobody can
reconstruct who actually reviewed what or how they scored it. Applicants call to ask where their
application stands, and the honest answer is that nobody knows without digging through old email
threads, while reviewers who already have a full plate keep getting handed more applications because
there is no record of who is already stretched thin.

They want one system to replace all of it: program officers manage the applications and decide who
reviews each one, reviewers see what has been put in front of them and score it on the same terms
every time, and a funding decision cannot go out until enough independent reviews are actually in
hand. Anyone should be able to tell where a given application stands, and how much has been requested
across a round, without emailing around to find out. That is the system you are building.

## What it must do

Everything below is required. Several of the ten spell out exact rules — what happens on an illegal
move, what a bulk action must report back, when a dismissed alert is allowed to reappear — and those
specifics are the actual ask, not just the bold headline in front of them.

1. **Accounts and roles.** People sign in with an email and password, and there are at least two
roles — a program officer role and a reviewer role. Program officers create, edit and archive grant
applications, assign reviewers to them, and record funding decisions. Reviewers see only the
applications they are assigned to, record reviews and declare conflicts of interest against them, but
cannot create, edit or archive an application, or assign reviewers to one. The difference must be
enforced on the server, not just hidden in the interface.

2. **Grant applications.** Program officers create applications with an applicant organization name,
a contact email, a funding round, an amount requested as an exact decimal amount, a submission date,
and an owning program officer, and can edit them later. Applications can be archived and restored.
Archiving an application hides it from the default views without destroying its review history.

3. **Review scores.** A reviewer records one review for an application, scoring it from 1 to 5
against three fixed criteria — Impact, Feasibility, and Budget Justification — with written comments.
A review can be saved as a draft and edited further, then completed, after which it can no longer be
changed. A reviewer can also declare a conflict of interest against an application, with a short
reason, which is what later blocks that reviewer from being assigned to it. Opening an application
shows every completed review against it, with the reviewer's name, its scores and its comments.

4. **Status lifecycle.** Applications move through *Submitted → Assigned → Under Review → Decided*.
A program officer assigns reviewers to move an application into Assigned, and moves it into Under
Review once reviewing is underway. It cannot move into Decided until at least three completed reviews
exist for it, and a reviewer who has declared a conflict of interest against the application can
never be assigned to it. Any other move must be rejected by the server with a message explaining why.

5. **Reviewer assignment.** A program officer assigns any number of reviewers to an application, and
a reviewer can be assigned to any number of applications over time, but never more than five active
assignments at once — an assignment counts as active until its review is completed. Assigning a
reviewer who has declared a conflict of interest against the application, or who is already at that
limit, is rejected by the server. A program officer can also remove a reviewer's assignment, but
only while its review is not yet completed. Each assignment carries a review due date, which a
program officer can change until the review is completed, and one not completed by its due date
counts as overdue. Every reviewer can see one list of every application assigned to them.

6. **Finding applications.** One list shows every application the viewer can see, with a text search
over applicant organization name and contact email, filters for funding round, status, owning
program officer and overdue reviews, sorting by submission date, amount requested or status, and
pagination showing the total number of matches. All of this must happen on the server — do not load
every application into the browser and filter there.

7. **Assigning reviewers in bulk.** A program officer picks a funding round and a set of reviewers,
and assigns each reviewer to every application in that round in a single action. The result is a
per-assignment report: succeeded, or refused with a reason — a declared conflict of interest, or the
reviewer already at the limit of five active assignments. Separately, export every completed review
for that round as a CSV file, broken out by criterion.

8. **A dashboard.** A landing view shows headline numbers — open applications, applications overdue
for review, applications ready for decision, and amount requested this month. It also breaks
applications down by status and by funding round, and charts applications decided per week over the
last eight weeks.

9. **History you cannot rewrite.** Every application has a timeline showing when it was created,
every status change with the old and new status and who made it, every reviewer assignment and
removal, and any comments left on it by a program officer or reviewer. Nothing in this timeline can
be edited or deleted after the fact, including by program officers.

10. **Overdue review alerts.** An assignment that counts as overdue appears in an alerts area for
program officers, with a count badge visible in the navigation. A program officer can dismiss the
alert. If the review due date later changes and then passes again before the review is completed,
the alert returns.

## Stretch ideas (optional)

None of these are required, and none substitute for a goal above. If you finish all ten with time
left over, pick whichever of these sounds most useful and build it:

- An applicant-facing portal for submitting and tracking applications online.
- Reviewer calibration reports comparing how harshly or leniently each reviewer scores.
- Configurable scoring rubrics that vary from one funding round to the next.
- A public listing of funded projects once decisions are announced.
- Automatic matching of reviewers to applications by area of expertise.
- An appeals process for applicants to contest a decision.
- Budget tracking against a total funding pool per round.
- Email notifications when a reviewer is assigned or a decision is made.
- Anonymized applications to reduce reviewer bias.


---

## What we are assessing

A working application is table stakes. Almost every serious candidate will produce something that runs, has a login, and roughly does what was asked. That's the floor, not the differentiator.

What actually separates submissions is the record of thinking behind the app: the decisions you made and why, the trade-offs you weighed, what you built first and what you deliberately left out, and whether you can explain any part of your own system when asked. We are hiring for judgement. The app is the evidence for that judgement, not the deliverable in itself.

We also read the code itself for structure and readability, which counts for a small share of the overall score.

## Time budget

Budget about 12 hours total, spent roughly 2 hours a day across a week.

This is not a race. We are not timing you against other candidates, and submitting early scores nothing extra. Twelve hours is a size guide so you know how much to attempt — pace yourself, stop when you're tired, and spend some of that time thinking and documenting, not only typing code.

## Pick any stack you like

Use any language, any framework, any UI library, any ORM, and any database access approach you want. We have no house stack, and no stack scores better than another — this round is not a test of whether you know particular tools.

Use whatever you are fastest and most confident in. Time spent learning something new to impress us is time not spent on the ten goals above, and it will show.

## Using AI is allowed and encouraged

Use AI tools however you want — to scaffold code, debug a stuck problem, write tests, draft documentation, or anything else that helps you move faster. A few things to know about how we treat it:

- We do not penalise AI use, and we make no attempt to detect it.
- We care about whether you understood, directed and verified the output — not about who or what produced the first draft of it.
- `docs/ai-prompts.md` must contain the prompts you actually used, including the ones that produced bad output and what you changed afterwards. If you used no AI at all, say so here and describe how you worked instead — that is assessed the same way.
- Submitting generated code you cannot explain is the single most common way candidates fail this round.

You are accountable for everything in your submission. If a reviewer points at a piece of code and asks why it's there, or why it works the way it does, "the AI wrote it" is not an answer.

## Use git properly

Publish to a public GitHub repository, and commit incrementally as the work actually happens — after each meaningful step, not in one pass at the end.

A repository whose entire history is a single "initial commit" containing a finished app scores zero on git history, and it colours how we read everything else in your submission, however good the app itself is. Your history is how we see the order you built in, where you got stuck, and how the design changed along the way. If it isn't there, we can't assess it, and we won't assume the best.

## What you must commit

Alongside your code, commit these five files under `docs/`. Your zip includes a stub for each with the questions it needs to answer — fill them in as you go, not from memory at the end.

| File | What it must answer |
|------|----------------------|
| `docs/architecture.md` | What the moving pieces are, how they talk to each other, where each one runs, the request path for one representative user action end to end, and what you decided not to build. |
| `docs/schema.md` | Every table's columns and types, which relationships are one-to-many versus many-to-many, which constraints live in the database versus the application, what you deliberately denormalised, and what would break first at 100x the data. |
| `docs/plan.md` | How you split the work into sessions, what order you built in and why, what you estimated versus what it actually took, and what you cut when you ran short. |
| `docs/decisions.md` | At least five real decisions — what you chose, what you rejected, and why — including at least one you later reversed. |
| `docs/ai-prompts.md` | The prompts you actually used, in order, grouped by what you were trying to do, including at least one that produced something wrong and what you did about it. |

## Host it for free

Deploy the whole thing somewhere reachable by URL, using free tiers only.

One combination that works, if you would rather not decide:

- **Database** — a managed service such as Supabase.
- **Server-side code** — Render.
- **Browser-side code** — Vercel.

Deploy in that order: create the database first, give the server its connection details as environment variables, then point the browser-side part at the server's public URL.

This is one option, not a requirement. Any free host is equally acceptable — everything on a single provider, one virtual machine, a container platform, a static host with serverless functions. The choice earns and loses nothing.

Requirements:

- A working live URL.
- Seeded with enough demo data to show the system doing something, not an empty shell.
- Demo credentials for every role recorded in `SUBMISSION.md`.
- Connection strings, keys and passwords kept in environment variables, never in the repository.
- Free tiers often sleep when idle and can take a minute or more to wake. Note it in `SUBMISSION.md` if yours does, so a slow first load is not read as a broken deployment.
- If you cannot get it hosted, submit anyway and record in `SUBMISSION.md` what you tried and where it broke.

## How to submit

Send us:

- The URL of your public GitHub repository.
- The URL of your live, deployed application.
- Your completed `SUBMISSION.md`, committed to the repository.

That's the whole submission. Nothing else to prepare, no separate form.

## What happens next

If your submission clears the bar, we'll set up a short call. We will ask about specific decisions we can see in your repository and its history — why you modelled something a particular way, what a certain commit was fixing, what you'd change if you kept going.

We're telling you this now because it should change how carefully you document as you go. Write `docs/decisions.md` for a version of yourself who has to explain it three weeks from now.

## Scope

The 10 goals stated in this brief are the cutoff. Meet all 10, solidly, and you have a complete submission.

Stretch ideas are optional. They exist for candidates who finish the 10 with time left and want to keep building — they are never required, and they do not make up for a goal you didn't hit. Doing 8 goals well beats doing 10 goals badly. If time is short, finish fewer goals properly rather than leaving all ten half-done.

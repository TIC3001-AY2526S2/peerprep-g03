# Matching Service
## Milestone 4 Local Setup

Create the following local env files:

`userService/server/.env`
- refer to `userService/server/.env.sample`
- ensure `JWT_SECRET` is set

`questionService/server/.env`
- refer to `questionService/server/.env.sample`

`matchingService/server/.env`
- refer to `matchingService/server/.env.sample`

Important:
- `matchingService/server/.env` must use the same `JWT_SECRET` as `userService/server/.env`
- matching service does not need question service DB settings

## Milestone 4 Local Test

1. Start the application from the project root:
npm run dev

2. Open `http://localhost:3000`.

3. Log in with two different user accounts in two separate browser sessions.
- Login 1: `ms4@test.com`
- Login 2: `ms4@test2.com`
- Password: `ms4Test!ng123`

4. In both sessions, click `Find Match` to open the matching page at `/matching`.

5. Test a successful match.
- User A selects `Algorithms` and `Easy`, then clicks `Find Match`
- User B selects `Algorithms` and `Hard`, then clicks `Find Match`

6. Verify the successful match result.
- topic match should succeed even when difficulty differs
- a 30-second timer should be visible while waiting
- success feedback should appear when a match is found
- matched peer information should be shown on the page
- available waiting requests can be viewed in the `Queue Snapshot` panel
- the `Debug Log` panel should show queue state before and after the match

7. Test an unsuccessful match.
- start matching with one user only
- do not start matching from the second user
- or start matching from a second user with a different topic
- wait 30 seconds

8. Verify the unsuccessful match result.
- timeout feedback should appear after 30 seconds
- a retry option should be available
- the queue and debug panel should reflect the timeout event

9. Optional cancel test.
- start matching with one user
- click `Cancel` before the timer expires
- verify that the request is removed from the queue snapshot

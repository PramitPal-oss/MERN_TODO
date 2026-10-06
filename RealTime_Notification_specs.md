# Persistent real-time comment notifications

## 1. Architecture and scope

Add Socket.io notifications to the existing application without redesigning the UI or changing the core comment workflow.

**Repository state:** No tracked changes were made. The earlier dependency installation attempts failed because registry access was denied. This review did not run tests; the validation steps below belong to implementation.

### Existing architecture relevant to this feature

| Area                  | Existing implementation                                                                     | Integration decision                                                  |
| --------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Backend               | Express 5, TypeScript, ESM; separate routes, controllers, services and models               | Follow these layers and existing `.js` import conventions             |
| Startup               | `server.ts` connects MongoDB, then calls `app.listen`                                       | Create one HTTP server shared by Express and Socket.io                |
| Authentication        | Bearer JWT plus database checks for active user, refresh session and authentication version | Extract these checks into one reusable helper for HTTP and sockets    |
| JWTs                  | HS256 with issuer/audience verification; access tokens expire after 15 minutes by default   | Reuse existing token verification                                     |
| Sessions              | Rotating refresh tokens, hashed database storage, revocation and reuse detection            | Preserve all existing behavior                                        |
| Browser token storage | Access token held in module memory in the Axios client                                      | Keep memory-only storage; send token through socket handshake `auth`  |
| Refresh cookies       | HttpOnly cookie scoped to `/api/v1/auth`                                                    | Keep refresh exclusively on the existing REST endpoint                |
| Users                 | `isActive`, `authVersion`, roles; deactivation preserves records                            | Notifications remain private to their recipient, including for admins |
| Posts/comments        | Posts soft-delete; comments hard-delete; authorship is immutable                            | Notify only after successful comment creation                         |
| Data conventions      | Mongoose references, timestamps, strict schemas, explicit DTOs and indexes                  | Reuse these patterns                                                  |
| REST                  | `/api/v1`, standard success/error envelopes, page/limit pagination                          | Add matching notification routes                                      |
| Frontend              | React 19, AuthContext, Axios, React Router, StrictMode                                      | Add one notification provider inside AuthProvider                     |
| UI                    | Shared Header, plain CSS, inline loading/error states; no toast system                      | Add a small accessible bell and dropdown using existing styling       |
| Tests                 | Jest/Supertest/MongoMemoryServer; Vitest/Testing Library                                    | Extend both suites                                                    |

**Decisions fixed for this implementation:**

- Only `NEW_COMMENT` notifications.
- Persisted inbox, unread count, individual read and mark-all-read.
- One backend process; no Redis, queues, change streams or microservices.
- No Tailwind/shadcn migration, browser push notifications, email notifications or toast dependency.
- As selected, a notification write failure preserves the successfully saved comment and produces a structured error log.

## 2. Backend design and contracts

### Notification database schema

Create a `Notification` model with `{ timestamps: true, strict: "throw" }`.

| Field                    | Definition                                                     |
| ------------------------ | -------------------------------------------------------------- |
| `recipient`              | Required immutable ObjectId reference to User                  |
| `actor`                  | Required immutable ObjectId reference to User                  |
| `type`                   | Required immutable enum containing `NEW_COMMENT`               |
| `message`                | Required immutable plain-text snapshot, maximum 320 characters |
| `post`                   | Required immutable ObjectId reference to Post                  |
| `postSlug`               | Required immutable string snapshot, maximum 200 characters     |
| `comment`                | Required immutable ObjectId reference to Comment               |
| `isRead`                 | Required boolean, default `false`                              |
| `createdAt`, `updatedAt` | Mongoose timestamps                                            |

Generate the message server-side: `John commented on "Node Streams"`.

The message and slug snapshots allow the notification to remain readable after profile/title changes or comment deletion. Do not store comment content or duplicate actor-name/title fields.

Indexes:

- `{ recipient: 1, createdAt: -1, _id: -1 }` for inbox pagination.
- `{ recipient: 1, isRead: 1 }` for unread count and read updates.
- Unique `{ recipient: 1, type: 1, comment: 1 }` to prevent duplicate notifications for the same saved comment.

No TTL or historical backfill. Existing comments do not generate notifications.

Use a `NotificationDto` containing:

```text
id, actorId, type, message, postId, postSlug, commentId,
isRead, createdAt, updatedAt
```

Recipient identity remains internal. Dates use ISO strings, matching existing serializers.

### Socket authentication

Extract the token/session validation currently in `authenticate.ts` into a transport-independent `access-session.service.ts`.

It must:

1. Verify the access token using `verifyAccessToken`.
2. Validate access-token type, required identifiers and expiration.
3. Load the user and refresh session.
4. Reject inactive users, revoked/expired sessions, ownership mismatches and authentication-version mismatches.
5. Return the authenticated identity and token expiration.

HTTP middleware retains its current public errors and `req.auth` structure.

Socket handshake:

```text
auth.accessToken
→ shared token/session validation
→ socket.data authenticated identity
→ server joins user:<verified userId>
```

- Never accept a client-supplied recipient, user ID or room name.
- Register no client-controlled join, notification-create or mark-read socket handlers.
- Reject missing or invalid credentials with sanitized `connect_error.data.code`.
- Enforce the configured frontend origin through both Socket.io CORS and handshake `allowRequest`; reject missing/untrusted origins.
- Use a bounded token string and a small socket payload limit, such as 16 KiB.
- Do not log handshake payloads or tokens.

Socket middleware runs once per connection, so handshake validation alone is insufficient for long-lived sessions. [Socket.io middleware documentation](https://socket.io/docs/v4/middlewares/)

For continued authorization:

- Disconnect at access-token expiration.
- Revalidate connected sessions every 30 seconds.
- Revalidate each candidate connection immediately before sending private notification events.
- On invalid authorization, emit a sanitized `auth:error` code and disconnect.
- On database validation failure, send no private payload; disconnect with a retryable service-unavailable code.
- Clear validation/expiration timers when sockets disconnect.

This prevents an already-connected revoked session from continuing to receive private events without adding socket dependencies to the existing auth/user mutation services.

### Socket server lifecycle

- Keep `app.ts` importable without opening listeners.
- After database connection, create `http.createServer(app)`.
- Initialize one Socket.io server on that HTTP server using `/socket.io`.
- Start listening on the existing `PORT`.
- Preserve HTTP polling fallback and WebSocket upgrade.
- Disable connection-state recovery for this version; authenticate each reconnection and recover the inbox through REST.
- Expose a narrow publishing function from the socket module. Keep raw `io` access out of comment controllers/services.
- When the socket server is absent, publishing is a harmless no-op so existing REST-only tests still work.
- Shutdown once: close Socket.io connections/timers and the shared HTTP server, then disconnect MongoDB. Include a bounded shutdown timeout.

### Backend event flow

```text
Validated authenticated comment request
→ load active post and its owner
→ persist comment
→ notification service
→ skip self-comment
→ persist notification
→ publish notification:new to authorized recipient connections
→ return existing comment response
```

Implementation details:

- Extend the existing active-post lookup to return the fields needed for the notification.
- Reuse the populated comment author for the message.
- Await the notification attempt; do not use an unobserved background promise.
- Put notification persistence and publishing behind `notification.service.ts`.
- Catch notification failures separately from comment failures.
- On persistence failure: log recipient/post/comment IDs and a sanitized error; retain the successful comment response.
- On emission failure: retain the notification for REST recovery.
- Use the unique index with an idempotent insert/upsert; emit `notification:new` only for a newly inserted notification.

**Reliability boundary:** Standalone MongoDB cannot atomically commit both documents using a transaction. A database failure or process crash between comment creation and notification creation can leave a comment without a notification. This is the explicitly selected tradeoff. Reconnect recovery covers persisted notifications, not missing writes.

### REST endpoints

All endpoints require existing `authenticate` middleware and use `sendSuccess`, `AppError`, validation helpers and `Cache-Control: no-store`.

| Endpoint                                    | Behavior                                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `GET /api/v1/notifications?page=1&limit=10` | Current recipient’s inbox, newest first; return `data: { items, unreadCount }` and existing pagination `meta` |
| `PATCH /api/v1/notifications/:id/read`      | Idempotently mark an owned notification read; return updated DTO                                              |
| `PATCH /api/v1/notifications/read-all`      | Mark the recipient’s existing unread notifications read; return `{ modifiedCount }`                           |

- Preserve existing pagination defaults and limits: page 1, limit 10, maximum limit 50.
- `unreadCount` covers the entire inbox, not just the requested page.
- Use a single aggregation with `$facet` for items, total and unread count to reduce inconsistent list/count reads.
- Register `read-all` before parameterized routes.
- PATCH routes require `trustedOrigin` and `noBody`.
- Scope every query/update by authenticated recipient.
- Return the same `404 NOTIFICATION_NOT_FOUND` for missing and foreign notification IDs.
- Admins receive no ownership override.
- Mark-all captures a server-side cutoff when processing begins and only updates notifications created through that cutoff; later arrivals remain unread.
- After read changes, emit `notifications:changed` to the recipient’s authorized connections. This is an invalidation signal; clients fetch authoritative state.

Socket event contracts:

| Event                   | Payload              |
| ----------------------- | -------------------- |
| `notification:new`      | `NotificationDto`    |
| `notifications:changed` | Empty object         |
| `auth:error`            | Sanitized `{ code }` |

## 3. Frontend integration and behavior

### Provider and connection ownership

Wrap the router as:

```text
AuthProvider
→ NotificationProvider
→ AppRouter
→ MainLayout / Header / NotificationBell
```

The notification provider owns one socket per authenticated browser tab. No sockets are created by page components or during render.

Add a socket factory using `autoConnect: false`. Register listeners before connecting and remove them during cleanup. React StrictMode must not leave duplicate active connections or listeners.

Derive the socket server origin from the existing API base URL:

```text
new URL(apiBaseURL, window.location.origin).origin
```

Use `/socket.io` as the transport path. This supports the current absolute development URL and relative same-origin production URL without introducing another environment variable.

### Token lifecycle

Extend the existing API client with token getter/subscription functions. The token remains in its current memory store.

- Login, registration and OAuth restoration: connect once authentication is accepted.
- Handshake: read the latest access token rather than capturing an old token.
- Token replacement: reconnect the existing socket to reauthenticate.
- Expiration: invoke the existing single-flight refresh mechanism, then reconnect.
- Allow one refresh attempt per authentication failure; avoid refresh/reconnect loops.
- Definitive invalid-session responses clear auth using the existing failure handler.
- Network/5xx refresh failures preserve authentication state and offer retry.
- Logout/auth failure/account change: disconnect immediately, clear notification state and cancel pending work.
- Preserve cross-tab logout through the existing BroadcastChannel.

Add an authentication generation guard around refresh completion and auth acceptance so an old request cannot restore a logged-out session or overwrite a newly signed-in user. This is necessary because socket-driven refresh adds another concurrent refresh caller.

### State management strategy

Use React context and a reducer; no additional state library.

State includes:

- Current page’s notifications and pagination metadata.
- Server-authoritative unread count.
- Loading/error state.
- Socket status: connecting, connected or disconnected.
- Pending read mutations.

MongoDB/REST is the source of truth; socket events make the UI update promptly.

Synchronization rules:

1. Fetch page one when authentication becomes available, even if Socket.io is unavailable.
2. Fetch authoritative state again after every socket connection/reconnection.
3. On `notification:new`, deduplicate by ID and immediately prepend on page one.
4. Refresh the current page/count after new or read-change events.
5. On later pages, preserve the selected page and refresh it; the badge still reflects all unread notifications.
6. Refresh when opening the dropdown or returning focus to the tab.
7. Coalesce concurrent refresh requests. If an event or mutation arrives during a fetch, invalidate that response and schedule another fetch so stale data cannot overwrite newer state.
8. Ignore all responses belonging to a previous authenticated user/generation.

Do not persist tokens or notification state in localStorage. Reloads recover through authenticated REST calls.

### Bell and dropdown

Add a compact bell to the authenticated Header.

- Show unread badge, visually capped at `99+`, with the exact count in its accessible label.
- Show message, relative timestamp and distinct unread styling.
- Include individual “Mark as read” and “Mark all as read” actions.
- Provide pagination using the existing component.
- Opening the dropdown does not automatically mark everything read.
- Clicking a notification marks it read, then navigates to `/posts/:postSlug`.
- On mark-read failure, retain unread state and display a retryable inline error.
- Include loading, empty, retry and disconnected states.
- Escape closes the dropdown; outside click closes it; keyboard focus returns to the bell.
- Use `aria-expanded`, a labeled panel and a polite live region for new notifications.
- Render all notification text through ordinary React text rendering.

Use existing CSS variables and components. No unrelated page changes.

### Exact notification scenarios and edge cases

| Scenario                              | Expected result                                                                   |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| A comments on B’s active post         | One persisted unread notification for B                                           |
| B comments on B’s post                | No notification                                                                   |
| Admin comments on another user’s post | Same behavior as any other commenter                                              |
| Comment creation fails                | No notification                                                                   |
| Comment is edited/deleted             | No new notification                                                               |
| Recipient is offline                  | Persist now; retrieve on next login/reconnect                                     |
| Multiple tabs/devices                 | Each authorized connection receives the event; read changes synchronize           |
| Duplicate event                       | One displayed entry; count reconciles through REST                                |
| Recipient is inactive                 | Notification can persist; no socket access until valid authentication is restored |
| Actor name/post title changes         | Historical message retains its snapshot                                           |
| Comment is later deleted              | Notification remains readable                                                     |
| Post is later deleted                 | Notification remains; existing post endpoint denies access                        |
| Backend restarts                      | Reconnect authenticates and reloads persisted inbox                               |
| Socket delivery fails                 | REST inbox remains usable                                                         |
| Notification write fails              | Comment succeeds; failure is logged; notification may be absent                   |

Do not introduce comment deep-linking: existing comments are paginated and have no anchor-navigation contract.

## 4. File changes and implementation sequence

### Existing files to modify

Paths below are relative to the repository root.

| Files                                                                | Change                                                                      |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `backend/package.json`, `frontend/package.json`, `package-lock.json` | Socket.io server/client dependencies; backend socket-client test dependency |
| `backend/src/server.ts`                                              | Shared HTTP/socket lifecycle and shutdown                                   |
| `backend/src/middleware/authenticate.ts`                             | Delegate to shared access-session validation                                |
| `backend/src/services/comments.service.ts`                           | Invoke notification service after comment persistence                       |
| `backend/src/routes/index.ts`                                        | Mount notification routes                                                   |
| `backend/src/utils/serializers.ts`                                   | Notification DTO                                                            |
| `backend/scripts/create-indexes.ts`                                  | Create notification indexes                                                 |
| `backend/src/tests/setup.ts`                                         | Initialize notification model/indexes                                       |
| `frontend/src/api/client.ts`                                         | Token access/subscriptions and stale-refresh protection                     |
| `frontend/src/api/index.ts`                                          | Notification API methods                                                    |
| `frontend/src/types/api.ts`                                          | Notification response types                                                 |
| `frontend/src/context/AuthContext.tsx`                               | Guard stale auth acceptance and integrate shared failure behavior           |
| `frontend/src/App.tsx`                                               | Install NotificationProvider                                                |
| `frontend/src/components/Header.tsx`                                 | Add notification bell                                                       |
| `frontend/src/styles/global.css`                                     | Scoped notification styling                                                 |
| `README.md`                                                          | Feature, endpoints, proxy setup, demo and limitations                       |

No changes are needed to existing user/post/comment schemas, Docker configuration or environment variables.

### New files to create

**Backend**

```text
backend/src/services/access-session.service.ts
backend/src/models/notification.model.ts
backend/src/services/notification.service.ts
backend/src/controllers/notification.controller.ts
backend/src/routes/notification.routes.ts
backend/src/validators/notification.schemas.ts
backend/src/socket/socket.auth.ts
backend/src/socket/socket.server.ts
backend/src/tests/integration/notifications.test.ts
backend/src/tests/integration/socket.test.ts
```

**Frontend**

```text
frontend/src/socket/client.ts
frontend/src/context/NotificationContext.tsx
frontend/src/components/NotificationBell.tsx
frontend/src/tests/notifications.test.tsx
frontend/src/tests/socket-client.test.ts
frontend/src/tests/auth-refresh.test.tsx
```

### Step-by-step implementation sequence

1. Install compatible Socket.io 4.x server/client packages and update the lockfile.
2. Extract shared authentication checks; confirm existing auth tests still pass.
3. Implement notification schema, indexes and serializer.
4. Implement recipient-scoped notification service and REST endpoints.
5. Add comment-to-notification integration with the selected failure policy.
6. Implement authenticated socket server, publishing gateway and lifecycle.
7. Add real socket integration tests.
8. Add frontend token lifecycle subscriptions and generation guards.
9. Implement provider, API synchronization and connection management.
10. Add bell/dropdown with existing styles and accessibility behavior.
11. Add frontend tests; run all existing tests, typechecks and production builds.
12. Update README and complete the two-user manual demonstration.

Deployment requires proxying both `/api` and `/socket.io` to the same backend, including WebSocket upgrade support. Run the existing index creation command before enabling traffic. No data migration or backfill is required.

## 5. Verification, risks and acceptance

### Testing strategy

**Backend REST and persistence**

- Comment creates one notification with the correct actor, recipient, post and comment.
- Self-comments and failed comment writes create none.
- Repeated handling of the same saved comment does not duplicate notifications.
- Retrieval returns only the authenticated recipient’s notifications.
- Pagination, sorting, total and global unread count are correct.
- Read-one and read-all are idempotent and recipient-scoped.
- Foreign notification access returns 404, including for admins.
- Invalid IDs/query/body and untrusted mutation origins are rejected.
- Injected notification-write failure preserves comment success.
- Injected publishing failure preserves notification persistence.
- Deleted references do not break DTO serialization.

**Real Socket.io integration**

Use an ephemeral HTTP port, the existing temporary MongoDB and actual socket clients.

- Valid authentication connects.
- Missing, malformed, expired, wrongly signed and refresh tokens fail.
- Revoked sessions, inactive users and authentication-version mismatches fail.
- Foreign/missing origins fail.
- Client-supplied identity or room requests cannot change membership.
- B receives A’s comment notification; A and unrelated C do not.
- Notification exists in MongoDB before receipt.
- Revocation after connection prevents subsequent private delivery.
- Expiration disconnects; a valid refreshed token can reconnect.
- Offline creation followed by reconnect recovers through REST.
- Read changes reach other authorized tabs.
- Shutdown closes clients, server and timers without open test handles.

**Frontend**

- Anonymous state opens no socket.
- StrictMode and rerenders leave one active connection.
- New notifications appear without navigation or refresh.
- Duplicate events and fetch/event races do not duplicate entries or corrupt counts.
- Reconnect and focus restore authoritative state.
- Token rotation reconnects with current credentials.
- Concurrent API/socket refresh shares one refresh request.
- Logout/account switching clears state and ignores stale async completions.
- Read failures retain unread state.
- Bell keyboard interaction, unread styling, empty/error states and inert text rendering work.

**Commands**

```powershell
npm.cmd run typecheck --workspaces
npm.cmd run test --workspaces
npm.cmd run build --workspaces
npm.cmd run test:coverage -w backend
```

Manually test with separate browser profiles: B owns the post; A comments while B is online, offline and reconnecting. Confirm reload persistence and read synchronization.

### Risks and regressions to watch

- **Refresh races:** preserve single-flight refresh and reject stale completions.
- **Long-lived authorization:** enforce expiration and validate before private delivery.
- **Stale counts:** fetch authoritative counts rather than relying on arithmetic increments.
- **Duplicate listeners:** clean up socket handlers and timers under StrictMode.
- **Shutdown hangs:** close upgraded connections before MongoDB.
- **Partial persistence:** document the selected comment/notification write gap.
- **Single-process deployment:** multiple independent API instances would need a shared adapter; that is outside this implementation.
- **Offset pagination:** concurrent arrivals can shift page boundaries, consistent with existing pagination limitations.
- **Delivery semantics:** Socket.io does not automatically replay missed server events; persisted REST recovery is required. [Socket.io delivery guarantees](https://socket.io/docs/v4/delivery-guarantees/)

Log notification persistence/publishing failures and socket authorization failures with IDs and sanitized codes. Never log access tokens, cookies, handshake objects or comment content.

### Final acceptance checklist

- [ ] A successful comment on another user’s post persists a notification.
- [ ] The online recipient sees it without refreshing.
- [ ] Self-comments produce no notification.
- [ ] Reload, offline use and backend restart preserve saved notifications.
- [ ] Unread count covers the full inbox.
- [ ] Read-one and mark-all persist and synchronize across tabs.
- [ ] Users cannot retrieve, alter or subscribe to another user’s notifications.
- [ ] Existing JWT/session protections apply to socket delivery.
- [ ] Token refresh, logout and account changes clean up correctly.
- [ ] Socket outages leave REST notifications usable.
- [ ] Notification failures preserve successfully saved comments as agreed.
- [ ] Existing functionality, architecture and UI styling remain intact.
- [ ] Tests, typechecks and builds pass.
- [ ] README documents deployment and the precise reliability limits.

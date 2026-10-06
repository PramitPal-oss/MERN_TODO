**This plan delivers a full frontend redesign, preceded by targeted functional and reliability fixes.** Page markup, layouts and component composition may be substantially rewritten. Existing business rules, API contracts, authentication architecture, backend structure and MongoDB models remain intact.

I reviewed [audit.specs.md](C:/Root/assessment/mern-blog-assignment/audit.specs.md) and rechecked the relevant source. No code or files were changed.

**Assignment qualification:** the original assignment brief is still unavailable. “Required” below refers to requirements explicitly stated in your messages. Existing features are marked separately as preservation requirements; Socket.io is treated as an existing bonus feature. The final checklist cannot certify unseen requirements.

**1. Gap classification and priorities**

| Category                               | Identified gaps                                                                                                                                                                                                  | Priority         |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **Critical assignment gaps**           | No missing core backend capability established. Registration lacks the requested social-login entry points. Complete assignment compliance and backend test health remain unverified.                            | First            |
| **Functional gaps affecting flows**    | Provider-only admin user editing; incomplete protected-admin controls; stale article responses; comment pagination after creation; last-item deletion; provider availability errors; missing post-detail actions | Before redesign  |
| **Security/authorization reliability** | Stale refresh can write a token before the context rejects it; refresh failures are classified too broadly; auth initialization failures redirect to login                                                       | Before redesign  |
| **Existing Socket.io bonus gaps**      | Fetch/event races, duplicate unread increments, stale account mutations and incomplete invalid-session handling                                                                                                  | After core fixes |
| **UI/UX gaps**                         | Generic page composition, inconsistent hierarchy, weak visual identity, basic admin shell, missing dates, uneven form treatment and incomplete asynchronous states                                               | Full redesign    |
| **Optional enhancements**              | Reading-time estimate, URL-persisted pagination, additional decorative artwork                                                                                                                                   | Deferred         |
| **Outside scope**                      | Images/uploads, categories, featured flags, likes, bookmarks, followers, rich text, drafts, profile editing, password recovery, analytics                                                                        | Excluded         |

Search and post-card comment counts are also deferred: neither has the required existing API support. Client-side filtering of one paginated page must not masquerade as global search.

**Implementation boundaries**

- No planned database changes or migrations.
- No planned public API payload, response or endpoint changes.
- No authentication, router, state-management or data-fetching framework replacement.
- Retain React, TypeScript, Tailwind 4, existing shadcn/Radix primitives and Lucide.
- Add **Sonner** for toast feedback. No other runtime dependency is planned.
- Keep **Inkstone** branding and adopt the reference’s design language.
- Each phase includes its own regression tests; Phase 7 is the final integration gate.

Paths below are relative to the repository root. API paths are relative to `/api/v1`.

**2. Phase 1 — Assignment baseline and missing required entry points**

**1A. Establish deterministic verification**

- **Missing / why:** the original brief has not been reconciled, and the previous backend run reported an environment-dependent OAuth assertion failure and a dashboard timeout. A trustworthy baseline is necessary to distinguish existing failures from regressions.
- **Assignment status:** verification requirement; not a newly missing product feature.
- **Frontend changes:** record existing tests and add actual page-flow coverage as subsequent tasks require it.
- **Backend changes:** configure explicit test-only environment values before application imports. Prevent local OAuth configuration from affecting disabled-provider tests. Diagnose the timeout before adjusting any timeout thresholds.
- **Database/models:** none; tests continue using their isolated MongoDB instance.
- **APIs affected:** existing auth, admin, post/comment and notification APIs are tested, not changed.
- **Files:** `backend/jest.config.cjs`, `backend/src/tests/setup.ts`, new early test-environment setup, affected integration tests; final documentation.
- **Dependencies:** none.
- **Regression risks:** inadvertently loading development configuration or weakening tests to achieve a pass.
- **Acceptance:** repeatable results independent of local provider credentials; timeout cause recorded and addressed; no test uses the development database. Original-brief reconciliation remains explicitly pending until that document is available.

**1B. Complete social authentication presentation**

- **Missing / why:** registration omits Google/Facebook entry points; provider loading, failure and disabled states are conflated.
- **Assignment status:** explicitly required by your requested login and registration screens.
- **Frontend changes:** extract shared provider controls for login/register. Model provider discovery as loading, ready or error. Show disabled providers only after a successful availability response; provide retry on discovery failure. Apply availability and pending states to account linking.
- **Backend changes:** none; reuse existing OAuth initiation, callback and linking flows.
- **Database/models:** none.
- **APIs affected:** `GET /auth/providers`, `GET /auth/{google,facebook}`, callbacks, `POST /auth/{provider}/link`.
- **Files:** `frontend/src/pages/AuthPages.tsx`, `UserPages.tsx`, new `components/auth/SocialAuthButtons.tsx`, related tests.
- **Dependencies:** 1A for deterministic provider tests.
- **Regression risks:** accidentally treating provider linking as sign-in, duplicate redirects, broken local authentication when providers fail.
- **Acceptance:** both auth screens expose the same supported providers; unavailable providers are truthful; request failures are retryable; email/password authentication remains usable; linking retains its existing explicit flow.

**Phase 1 exit:** missing requested authentication entry points are covered, and the verification baseline has an understood status.

**3. Phase 2 — Security/RBAC, admin and post/comment corrections**

Implement these in the order shown: session reliability, administration, then content flows.

**2A. Correct session lifecycle and authorization-state handling**

- **Missing / why:** `doRefresh()` writes a token before AuthContext checks its generation. A stale refresh may therefore alter API credentials after logout/account switching. Network refresh failures currently clear authentication indiscriminately.
- **Assignment status:** correctness of existing required authentication; architecture must remain unchanged.
- **Frontend changes:** share an authentication generation between token handling and AuthContext. Guard refresh execution/completion, token writes and retried requests. Preserve single-flight refresh and cross-tab coordination. Distinguish definitive invalid sessions from temporary failures. Show retryable auth initialization errors in guards and neutral loading controls in the header.
- **Backend changes:** none planned; retain refresh rotation, session revocation and server RBAC.
- **Database/models:** none.
- **APIs affected:** `/auth/refresh`, `/auth/logout`, `/auth/login`, `/auth/register`, protected request retries.
- **Files:** `frontend/src/api/client.ts`, `context/AuthContext.tsx`, `routes/Guards.tsx`, `components/Header.tsx`, auth/guard tests.
- **Dependencies:** 1A.
- **Regression risks:** refresh loops, retrying an old request under a different account, clearing a valid newer session, bypassing initialization guards.
- **Acceptance:** delayed refresh cannot restore an old token after logout or overwrite a new account; stale requests are not replayed across accounts; concurrent refresh callers share work; invalid sessions clear authentication; temporary errors permit recovery without rendering unauthorized content.

The new tests must exercise the actual token-writing path. Mocking `refreshAccess()` entirely would miss the audited defect.

**2B. Correct admin user management**

- **Missing / why:** editing requires an email even for supported provider-only users; frontend restrictions do not fully represent protected/self-admin rules.
- **Assignment status:** admin management is required; provider-only and protected-admin handling preserve existing supported behavior.
- **Frontend changes:** use validation matching existing create/update contracts. On edit, submit changed fields only. Omit unchanged absent email; do not offer clearing an existing email because the API does not support it. Disable prohibited self/protected-admin demotion and deactivation with an explanation. Add pending state for reactivation and field-level server errors.
- **Backend changes:** none; retain current enforcement and optional update fields.
- **Database/models:** none.
- **APIs affected:** `GET/POST /users`, `GET/PATCH /users/:id`; existing deactivation semantics.
- **Files:** `frontend/src/pages/AdminPages.tsx`, new admin form/action components, frontend tests; existing backend authorization tests extended where needed.
- **Dependencies:** 2A.
- **Regression risks:** sending empty email strings, blocking legitimate edits, changing user-deletion semantics, relying solely on disabled controls.
- **Acceptance:** provider-only users can have name/role/status edited without invented email; creation still requires valid email/password; protected/self-admin restrictions match the server; duplicate email and validation errors appear beside relevant fields.

**2C. Correct post retrieval, editing and authorized actions**

- **Missing / why:** slug changes can retain old loading/error state or accept late responses. Post detail lacks edit/delete actions. Edit forms can remain visible after failed resource loading.
- **Assignment status:** post CRUD and authorization are required; detail actions are an explicitly requested flow improvement.
- **Frontend changes:** reset resource state when identifiers change; reject stale responses; block submission until the correct editable resource loads. Add owner/admin detail actions using the existing confirmation dialog. Use contextual not-found, forbidden and retryable-error views. Keep create/edit fields limited to title and content.
- **Backend changes:** none.
- **Database/models:** none.
- **APIs affected:** `GET /posts/slug/:slug`, `GET/POST/PATCH/DELETE /posts[/:id]`.
- **Files:** `frontend/src/pages/BlogPages.tsx`, `UserPages.tsx`, new `components/posts/PostActions.tsx`, relevant tests.
- **Dependencies:** 2A.
- **Regression risks:** mixing slug and ID routes, exposing foreign-content actions, overwriting editor contents, interpreting soft deletion as permanent removal.
- **Acceptance:** rapid A→B navigation never renders A as B; failed editing loads cannot submit; only owners/admins see actions; server rejection remains handled; editing keeps the slug stable; successful detail deletion returns to the post listing.

**2D. Correct comments and pagination**

- **Missing / why:** comments lack explicit loading state; creation mixes page changes with a loader using an old page value; deletion can leave empty out-of-range pages.
- **Assignment status:** required post/comment usability and pagination.
- **Frontend changes:** separate retrieval and mutation states; request explicit target pages; guard stale responses by resource/request identity. Use `meta.total` for the discussion count. After comment creation, refresh authoritative metadata and navigate to the last valid page under the existing oldest-first ordering. After deletion, clamp to a valid page. Apply page-boundary handling to My Posts and admin lists too.
- **Backend changes:** none; retain ordering and pagination contracts.
- **Database/models:** none.
- **APIs affected:** post/comment lists, comment creation/edit/deletion, admin lists.
- **Files:** `frontend/src/pages/BlogPages.tsx`, `UserPages.tsx`, `AdminPages.tsx`, `components/Pagination.tsx`, extracted comment components and tests.
- **Dependencies:** 2C; shared pending behavior can initially be implemented locally and consolidated in Phase 4.
- **Regression risks:** duplicate fetches, old-page results overwriting new ones, announcing mutation failure after a successful write.
- **Acceptance:** no empty message before successful retrieval; no conflicting page loads; creation feedback appears and the latest comment page loads; last-row deletion recovers to a valid page; failed writes retain entered content; failed refresh after a successful write does not encourage duplicate submission.

Concurrent comments can shift offset pagination. Do not introduce a new comment-location endpoint to guarantee positioning under every concurrent-write scenario.

**Phase 2 exit:** required flows and authorization presentation work independently of the visual redesign.

**4. Phase 3 — Complete reliability of the existing Socket.io bonus**

**3A. Correct notification synchronization and lifecycle**

- **Missing / why:** an invalidated fetch can overwrite newer state; duplicate events increment unread counts; asynchronous read mutations need account-generation protection; socket invalid-session handling is incomplete.
- **Assignment status:** existing bonus functionality to preserve and complete, not a new assignment requirement.
- **Frontend changes:** scope fetches, mutations and event handlers to the active authentication generation. Track a request/state revision and discard responses invalidated by newer events or mutations. Coalesce refresh requests. Deduplicate event IDs, cap page-one insertion to the page size and reconcile counts through REST. Preserve later-page selection. Use Phase 2 authentication handling for expiration/invalid sessions; bound refresh attempts and clean up listeners on logout/account change.
- **Backend changes:** none planned. Retain recipient-scoped rooms, authorization checks, persistence and existing event names.
- **Database/models:** none.
- **APIs affected:** `/notifications`, `/notifications/:id/read`, `/notifications/read-all`; existing socket events.
- **Files:** `frontend/src/context/NotificationContext.tsx`, `socket/client.ts`, `components/NotificationBell.tsx`, notification/socket/auth tests.
- **Dependencies:** 2A and 2D.
- **Regression risks:** reconnect loops, duplicate listeners, cross-account stale state, badge drift, hiding REST notifications during socket outages.
- **Acceptance:** duplicate events produce one entry without cumulative unread inflation; stale fetches cannot overwrite newer state; logout/account switch clears and isolates state; reconnect restores persisted notifications; read changes synchronize between tabs; REST remains usable when sockets disconnect.

Verify notification persistence, self-comment exclusion and recipient isolation with existing backend tests and a two-user demonstration. Do not add Redis, queues or a new delivery architecture.

**Phase 3 exit:** the bonus feature behaves reliably without expanding its scope.

**5. Phase 4 — Frontend architecture cleanup**

**4A. Extract reusable presentation boundaries**

- **Missing / why:** repeated form fields, metadata, desktop/mobile row actions and comment markup make a full redesign inconsistent and harder to verify.
- **Assignment status:** redesign requirement, not an original backend feature.
- **Frontend changes:** extract domain-specific components while retaining page-level API orchestration and corrected behavior. Share date formatting and frontend permission predicates. Keep existing page modules as route-facing exports.
- **Backend changes:** none.
- **Database/models:** none.
- **APIs affected:** none; no public contract changes.
- **Files:** existing page modules and components; new components listed below.
- **Dependencies:** Phases 1–3.
- **Regression risks:** lost form state, changed mutation timing, duplicated desktop/mobile handlers, unnecessary abstraction.
- **Acceptance:** desktop/mobile actions use shared permissions and handlers; create/edit share a post form; public/admin comment editing share field treatment; route exports and API payloads remain compatible.

Introduce these focused components:

| Location under `frontend/src`            | Responsibility                                      |
| ---------------------------------------- | --------------------------------------------------- |
| `components/auth/AuthCard.tsx`           | Auth branding, heading, form and footer composition |
| `components/auth/SocialAuthButtons.tsx`  | Supported provider entry points                     |
| `components/forms/FormField.tsx`         | Label, help, error and accessibility association    |
| `components/posts/PostMeta.tsx`          | Author initials/name/date                           |
| `components/posts/PostActions.tsx`       | Authorized actions                                  |
| `components/posts/PostForm.tsx`          | Shared title/content fields                         |
| `components/comments/CommentSection.tsx` | Comment retrieval and interaction orchestration     |
| `components/comments/CommentItem.tsx`    | Comment presentation and actions                    |
| `components/comments/CommentForm.tsx`    | Shared comment input treatment                      |
| `components/admin/ManagementTable.tsx`   | Consistent table frame/header/footer                |
| `components/admin/UserActions.tsx`       | Shared desktop/mobile user actions                  |
| `components/LoadingSkeletons.tsx`        | Content-specific loading shapes                     |
| `lib/format.ts`, `lib/permissions.ts`    | Shared display utilities                            |
| `pages/HomePage.tsx`                     | New landing-page composition                        |

Do not build a generic form engine or introduce a table-state library.

Shared component contracts should include:

- `Pagination`: optional pending state and compact mode.
- `EmptyState`: title, description and optional action.
- `ErrorState`: contextual message and optional retry.
- `PostActions`: post, authorization context and completion callbacks.
- Skeletons: explicit grid/article/comments/table/metrics variants.

**Phase 4 exit:** reusable boundaries are ready for substantial markup changes without rewriting business logic.

**6. Phase 5 — Full Tailwind + shadcn UI redesign**

This phase replaces the current page composition where necessary. It is not limited to changing colors or adding utility classes.

**5A. Design system and application shells**

- **Missing / why:** the current visual system does not establish the reference’s hierarchy, identity or professional workspace structure.
- **Assignment status:** explicitly required redesign.
- **Frontend changes:** rewrite shared theme and layout markup. Build a branded public header, mobile navigation, consistent auth surface and a dedicated navy admin sidebar/workspace. Retain provider placement above routes.
- **Backend changes / database/models:** none.
- **APIs affected:** none.
- **Files:** `styles/global.css`, `layouts/MainLayout.tsx`, `layouts/AdminLayout.tsx`, `components/Header.tsx`, `MobileNavigation.tsx`, `PageHeading.tsx`, affected UI primitives.
- **Dependencies:** Phase 4; existing Tailwind/shadcn/Lucide dependencies.
- **Regression risks:** CSS changes affecting portals, reduced contrast, clipped menus, remounting auth/notification providers.
- **Acceptance:** one coherent visual system spans all pages; active navigation is obvious; public and admin shells remain usable on mobile; dialogs/popovers match the theme; no auth/socket provider remount caused by navigation.

Concrete design defaults:

| Element             | Specification                                                                           |
| ------------------- | --------------------------------------------------------------------------------------- |
| Background/surfaces | Light slate background, white cards, subtle gray-blue borders                           |
| Primary/accent      | Blue `#2563EB`; restrained indigo highlights                                            |
| Admin sidebar       | Navy surface, readable light text, blue active treatment                                |
| Typography          | System sans-serif; clear 14/16px interface text, 18px article text, responsive headings |
| Spacing             | Shared 4/8/12/16/24/32/48px scale                                                       |
| Cards               | Approximately 12px radius; minimal shadow                                               |
| Containers          | Public about 1152px; admin about 1280px; article 720px                                  |
| Controls            | Consistent heights, explicit focus, accessible labels and comfortable touch targets     |
| Branding            | Inkstone name with a simple Lucide book mark                                            |
| Motion              | Subtle transitions; honor reduced-motion preferences                                    |

**5B. Public home, listing and article redesign**

- **Missing / why:** home lacks a designed hero and clear conversion paths; cards and detail lack a distinctive editorial hierarchy.
- **Assignment status:** public reading is required; the redesigned composition is explicitly requested.
- **Frontend changes:** add HomePage at `/`; move the full feed to new `/posts`. Home uses three latest posts from the existing list API. Build a split desktop hero with copy, CTAs and decorative CSS/SVG artwork; stack on mobile. Use a three-column desktop home grid and a spacious, single-column full feed. Rewrite article title/metadata/actions and discussion layout.
- **Backend changes / database/models:** none.
- **APIs affected:** existing posts/comments APIs only.
- **Files:** `pages/HomePage.tsx`, `BlogPages.tsx`, `components/PostCard.tsx`, extracted post/comment components, `routes/AppRouter.tsx`.
- **Dependencies:** 5A, corrected content flows.
- **Regression risks:** broken links, confusing Home versus Posts navigation, fabricated metadata, unreadable long content.
- **Acceptance:** homepage has a strong visual focal point and clear Explore/Register or Write/My Posts CTAs; cards use actual titles/excerpts/authors/dates; article remains readable without images; existing slug and edit URLs continue working.

Do not leave empty thumbnail placeholders or reproduce the category sidebar.

**5C. Authentication, editor, My Posts and Account redesign**

- **Missing / why:** current forms and personal pages look generic and lack consistent composition.
- **Assignment status:** existing flows plus explicitly requested full redesign.
- **Frontend changes:** rebuild login/register using the shared auth shell; add proper headings and provider section. Rebuild the editor around title/content, helpful field copy and a consistent action footer. Turn My Posts into an identity header and compact post-management list. Keep Account read-only except existing provider linking.
- **Backend changes / database/models:** none.
- **APIs affected:** existing auth/provider and post APIs.
- **Files:** `pages/AuthPages.tsx`, `UserPages.tsx`, shared auth/form/post components.
- **Dependencies:** 1B, Phase 2, 5A.
- **Regression risks:** misleading profile controls, altered validation limits, unsupported editor fields, loss of form contents.
- **Acceptance:** forms are visually consistent and accessible; editor submits only title/content; My Posts shows current-user data and authorized actions; no profile editing, draft controls or rich-text toolbar appears.

**5D. Full administration redesign**

- **Missing / why:** the existing admin pages have the right capabilities but insufficient workspace hierarchy and table presentation.
- **Assignment status:** administration and three totals are required; visual redesign is explicitly requested.
- **Frontend changes:** rebuild dashboard composition with three metric cards and purposeful management links. Redesign users/posts/comments tables with stronger headers, available dates, truthful badges and compact action menus. Use mobile management cards sharing the same action components.
- **Backend changes / database/models:** none.
- **APIs affected:** existing `/admin/stats`, `/users`, `/admin/posts`, `/admin/comments` and existing mutations.
- **Files:** `pages/AdminPages.tsx`, `layouts/AdminLayout.tsx`, `components/StatCard.tsx`, admin components and table styles.
- **Dependencies:** 2B, 2D, 5A.
- **Regression risks:** mislabeling counts, exposing actions for deleted posts, hiding moderation functionality, mobile action mismatch.
- **Acceptance:** dashboard labels are **Total Users**, **Total Posts**, **Total Comments**, with explanatory text for existing counting semantics. Users show joined dates; posts/comments show created dates. Active/deleted/all filtering remains. Deleted posts have no unsupported edit/restore action.

Admin columns:

| Page     | Columns                                                                               |
| -------- | ------------------------------------------------------------------------------------- |
| Users    | Name/email, role, active status, joined date, actions                                 |
| Posts    | Title, author, active/deleted status, created date, actions                           |
| Comments | Content preview, parent post/deleted-parent indication, author, created date, actions |

**shadcn mapping for Phase 5**

Reuse Button, Input, Textarea, Label, Card, Avatar, Badge, Table, DropdownMenu, Sheet, Dialog, AlertDialog, Popover, Alert and Skeleton. Add Sonner. Retain the existing pagination wrapper.

Tabs are unnecessary unless there are genuinely distinct supported views; do not create decorative profile tabs.

**Phase 5 exit:** every existing screen has a deliberate redesigned composition, not a mixture of old and new layouts.

**7. Phase 6 — Complete states, responsiveness and accessibility**

**6A. Standardize asynchronous and mutation feedback**

- **Missing / why:** repeated spinner replacements cause layout movement; error/empty states can conflict; success feedback is inconsistent.
- **Assignment status:** explicitly requested UX requirement.
- **Frontend changes:** install one Toaster above route content. Use matching skeletons on initial loads; retain valid content during same-resource refreshes. Show inline retry errors. Disable conflicting actions while pending. Separate write success from subsequent refresh failure. Give empty states relevant actions.
- **Backend changes / database/models:** none.
- **APIs affected:** presentation of existing requests only.
- **Files:** `App.tsx`, `components/States.tsx`, `Pagination.tsx`, `LoadingSkeletons.tsx`, `NotificationBell.tsx`, page modules, new `components/ui/sonner.tsx`; frontend package manifest and lockfile.
- **Dependencies:** Phase 5; Sonner.
- **Regression risks:** duplicate toasts, stale content presented as current, unnecessary disabling, notification popover flicker.
- **Acceptance:** initial loading/error/empty/content states are mutually exclusive; background refresh preserves layout; failed mutations retain input; successful writes produce one confirmation; retrying a failed refresh does not repeat a mutation.

**6B. Responsive and accessible interaction pass**

- **Missing / why:** long content, dense metadata, table actions and modal behavior are not fully validated across viewport sizes.
- **Assignment status:** explicitly requested responsive/polished UI.
- **Frontend changes:** ensure wrapping and minimum-width rules, mobile action layouts and compact pagination. Add semantic headings and field associations. Verify keyboard focus and return behavior. Make notification navigation and mark-read separate interactive elements rather than nested interactive targets.
- **Backend changes / database/models:** none.
- **APIs affected:** none.
- **Files:** shared layouts/components, notification bell, dialogs, forms, tables and relevant tests.
- **Dependencies:** 6A.
- **Regression risks:** hidden controls, focus traps, unreadable metadata, actions firing twice through event bubbling.
- **Acceptance:** no page-wide horizontal overflow at 320/375/768/1024/1440px; all actions work by keyboard; dialogs close and return focus correctly; long names/emails/titles remain usable; 200% zoom retains access to controls.

**Phase 6 exit:** populated, loading, empty, failed and pending versions of each screen receive the same level of design attention.

**8. Rewrite, reuse and preserve decisions**

| Existing frontend files                                      | Decision                                                                                            |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `pages/BlogPages.tsx`                                        | **Rewrite presentation substantially**; extract discussion; preserve corrected fetching/mutations   |
| `pages/AuthPages.tsx`                                        | **Rewrite presentation**; retain authentication calls and callback behavior                         |
| `pages/UserPages.tsx`                                        | **Rewrite editor/My Posts/Account presentation**; share forms and actions                           |
| `pages/AdminPages.tsx`                                       | **Rewrite dashboard, table, mobile-card and form markup**; preserve corrected business interactions |
| `pages/StatusPages.tsx`                                      | **Redesign** consistent recovery screens                                                            |
| `layouts/MainLayout.tsx`, `AdminLayout.tsx`                  | **Rewrite layout composition**                                                                      |
| `components/Header.tsx`, `MobileNavigation.tsx`              | **Rework presentation/navigation**; preserve accessible menu behavior                               |
| `components/PostCard.tsx`, `StatCard.tsx`, `PageHeading.tsx` | **Rework visual composition**                                                                       |
| `components/States.tsx`, `Pagination.tsx`                    | **Extend and redesign** shared state contracts                                                      |
| `components/NotificationBell.tsx`                            | **Redesign rendering**, preserve provider-driven behavior; improve interaction semantics            |
| `ConfirmActionDialog.tsx`, `EditCommentDialog.tsx`           | **Reuse and refine** labels, errors, focus and pending behavior                                     |
| `UserAvatar.tsx`, `SafeText.tsx`                             | **Reuse** initials and safe plain-text behavior; improve wrapping if needed                         |
| `components/ui/*`                                            | **Reuse primitives** and consistently restyle; add Sonner only                                      |
| `routes/AppRouter.tsx`                                       | **Small structural update** for home/feed separation                                                |
| `routes/Guards.tsx`                                          | **Targeted correctness update**, not replacement                                                    |
| `api/client.ts`, `context/AuthContext.tsx`                   | **Targeted lifecycle fixes only**                                                                   |
| `context/NotificationContext.tsx`, `socket/client.ts`        | **Targeted synchronization/lifecycle fixes only**                                                   |
| `api/index.ts`, `types/api.ts`                               | **Preserve contracts**; no feature-driven DTO expansion                                             |
| Vite/TypeScript/Tailwind setup                               | **Reuse**; no reinstall or framework migration                                                      |

Existing routes remain. `/posts` is the only new required frontend route. There is no new `/profile`, analytics, category or notification-inbox route.

**9. Phase 7 — Final QA and assignment verification**

**7A. Verify the complete application and document it**

- **Missing / why:** passing component tests do not prove complete role-based workflows or visual readiness.
- **Assignment status:** delivery verification; original rubric reconciliation remains dependent on the brief.
- **Frontend changes:** add meaningful page-flow regression tests and capture representative screen comparisons.
- **Backend changes:** tests only unless they reveal a reproducible defect in an existing requirement.
- **Database/models:** none; use isolated test/demo data.
- **APIs affected:** all existing APIs verified for compatibility.
- **Files:** frontend/backend tests, `README.md`, `Design-specs.md`; retain the audit as a historical assessment.
- **Dependencies:** Phases 1–6.
- **Regression risks:** assuming mocks prove OAuth integration, testing only successful responses, accepting visual screenshots without working actions.
- **Acceptance:** typechecks, tests and production builds pass; manual role-based workflows pass; responsive screenshots meet the specified design direction; no unsupported controls remain; documented limitations match actual behavior.

Run:

```powershell
npm.cmd run typecheck --workspaces
npm.cmd test --workspaces
npm.cmd run build --workspaces
```

Manual acceptance scenarios:

1. Visitor browses home, listing, article and paginated comments.
2. User registers/logs in, refreshes the page and logs out.
3. Configured Google/Facebook flows complete; disabled providers remain truthful.
4. Owner creates, edits and deletes a post; another user cannot mutate it.
5. Users add/edit/delete permitted comments; admins moderate other users’ content.
6. Admin creates/edits/deactivates/reactivates supported users.
7. Protected-admin and self-admin restrictions remain enforced.
8. Admin totals and active/deleted lists match current API semantics.
9. Two users demonstrate persisted notifications, read synchronization and reconnect recovery.
10. Delayed/error responses, expired sessions and account switching do not show stale private state.
11. Every page works at the target viewports and with keyboard navigation.

Deploy as the existing frontend application. No database rollout is required; retain existing `/api` and `/socket.io` proxy behavior.

**10. Deferred and excluded work**

| Feature                                     | Decision                                                  |
| ------------------------------------------- | --------------------------------------------------------- |
| Reading-time estimate                       | Optional after acceptance; excluded from committed phases |
| URL-persisted pagination                    | Optional follow-up                                        |
| Additional illustration polish              | Optional; basic decorative hero is already included       |
| Search                                      | Deferred; no fake search box or page-only filtering       |
| Post-card comment counts                    | Deferred; no per-card request fan-out                     |
| Images/uploads/categories/featured flags    | Excluded                                                  |
| Likes/bookmarks/followers/replies           | Excluded                                                  |
| Rich text/drafts/autosave                   | Excluded                                                  |
| Profile editing/bio/avatar upload           | Excluded                                                  |
| Password recovery/remember-me controls      | Excluded                                                  |
| Analytics/time-series charts                | Excluded                                                  |
| Redis/queues/new state-management framework | Excluded                                                  |

**11. Final requirement checklist**

This covers every requirement identifiable from your supplied requests and the inspected repository. **“Covered” means the plan includes implementation or preservation plus verification; it does not mean implementation is complete.**

| Requirement                                  | Basis                              | Plan coverage                           | Expected completion result                            |
| -------------------------------------------- | ---------------------------------- | --------------------------------------- | ----------------------------------------------------- |
| React frontend                               | Explicit                           | Phases 4–7                              | Covered                                               |
| Node/Express/MongoDB architecture            | Existing assignment implementation | Preserve throughout                     | Covered                                               |
| Email/password registration/login            | Explicit                           | 1B, 2A, 5C, 7A                          | Covered                                               |
| Google/Facebook authentication               | Explicit                           | 1B, 5C, 7A                              | Covered; live verification needs configured providers |
| JWT authentication and refresh handling      | Explicit preservation              | 2A, 7A                                  | Covered with lifecycle regression tests               |
| Logout and session invalidation              | Existing core flow                 | 2A, 7A                                  | Covered                                               |
| USER/ADMIN RBAC                              | Explicit                           | 2A–2C, 7A                               | Covered; server remains authoritative                 |
| Ownership enforcement                        | Explicit                           | 2C–2D, 7A                               | Covered                                               |
| Public paginated posts                       | Explicit                           | 2D, 5B, 7A                              | Covered                                               |
| Post detail: title/author/date/content       | Explicit                           | 2C, 5B                                  | Covered                                               |
| Post creation/editing                        | Explicit                           | 2C, 5C                                  | Covered; title/content only                           |
| Backend-generated stable slugs               | Explicit preservation              | 2C, 7A                                  | Covered                                               |
| Post deletion/soft deletion                  | Existing core semantics            | 2C, 5D, 7A                              | Covered                                               |
| Paginated comments                           | Existing functionality             | 2D, 5B                                  | Covered                                               |
| Add/edit/delete authorized comments          | Explicit                           | 2D, 5B, 7A                              | Covered                                               |
| My Posts/lightweight account                 | Explicit                           | 5C                                      | Covered                                               |
| Explicit provider linking                    | Existing feature                   | 1B, 5C                                  | Preserved                                             |
| Admin Total Users/Posts/Comments             | Explicit assignment requirement    | 5D, 7A                                  | Covered with existing count semantics                 |
| Admin user management                        | Explicit                           | 2B, 5D, 7A                              | Covered                                               |
| Admin post management                        | Explicit                           | 2C–2D, 5D                               | Covered                                               |
| Admin comment management                     | Explicit when supported            | 2D, 5D                                  | Covered; APIs already exist                           |
| Backend validation                           | Explicit preservation              | 2B–2D, 7A                               | Preserved and reflected in forms                      |
| Activity logging                             | Repository baseline                | Preserve; Phase 7 verification          | Covered as existing behavior                          |
| Persistent Socket.io notifications           | Existing bonus                     | Phase 3, 6A–6B, 7A                      | Preserved and corrected                               |
| Notification privacy/read state/recovery     | Existing bonus                     | Phase 3, 7A                             | Covered                                               |
| Tailwind + shadcn + Lucide redesign          | Explicit                           | Phases 4–6                              | Covered as a full presentation rewrite                |
| Professional forms/cards/admin tables        | Explicit                           | Phase 5                                 | Covered                                               |
| Loading/error/empty/pending states           | Explicit                           | Phase 2 foundations, Phase 6 completion | Covered                                               |
| Confirmation dialogs/toast feedback          | Explicit                           | Phases 5–6                              | Covered                                               |
| Responsive and accessible interaction        | Explicit                           | 6B, 7A                                  | Covered                                               |
| Tests/build/documentation                    | Repository delivery baseline       | 1A, 7A                                  | Covered                                               |
| Every item in the original assignment rubric | Original brief unavailable         | Reconcile in 1A and 7A                  | **Not yet certifiable**                               |

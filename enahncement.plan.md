**1. Executive Summary**

This plan supersedes the earlier exclusions for replies and likes. It delivers:

- The mandatory MERN assignment functionality listed in your attachment.
- One-level comment replies.
- Post likes and comment/reply likes.
- Reliable existing Socket.io notifications, extended to replies.
- A full frontend redesign closely following the reference’s visual language.
- Focused backend extensions, without introducing social-network architecture.

**No code was implemented or files modified during this turn.**

The repository now contains staged changes made since the audit, including shared social-login controls, authentication-generation handling, retryable guards, `DataGrid`, `useQuery`, and `useMutation`. Preserve and verify these changes. Do not reimplement them from the older audit description.

The assignment checklist in your latest attachment is the mandatory baseline for this plan. Earlier test results do not establish that the newly staged implementation passes.

**2. Final Scope**

| Scope                     | Included                                                                                                                                                                                                                                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Assignment-required**   | Registration/login/logout; JWT/refresh; Google/Facebook OAuth; hashing; auth rate limiting; environment configuration; API RBAC; post/comment CRUD; validation; slugs; post soft deletion; admin management/statistics; layered Express/Mongoose architecture; indexes; pagination; tests; protected React routes |
| **Approved enhancements** | One-level replies; post likes; comment and reply likes; existing persistent notifications; reply notifications                                                                                                                                                                                                    |
| **UI redesign**           | Public/authenticated/admin layouts; reference-inspired home, feed, article, forms, personal pages, dashboards and tables; reusable components; responsive states and feedback                                                                                                                                     |
| **Optional, deferred**    | Reading-time estimate; URL-persisted pagination; additional decorative artwork                                                                                                                                                                                                                                    |
| **Excluded**              | Uploads, categories, tags, bookmarks, followers, messaging, rich text, drafts, analytics, recommendation systems, infinite nesting, reaction types, like notifications                                                                                                                                            |

Concrete defaults:

- Keep **Inkstone** branding.
- Implement comment likes, including replies: they use the same model and authorization.
- Keep REST responsible for CRUD, replies and likes.
- Keep Socket.io focused on notifications.
- Retain existing post deletion semantics.
- Extend comment deletion deliberately to preserve reply relationships, as specified below.
- Add no new state-management or data-fetching library.
- Add Sonner for toast feedback; reuse installed UI dependencies.

**3. Audit-to-Implementation Gap Matrix**

Priority corresponds to the implementation phase.

| Feature                                     | Current Status                                  | Required By Assignment? | Approved Enhancement? | Backend Changes                                                            | Frontend Changes                                             | Database Changes             | Priority | Recommendation                            |
| ------------------------------------------- | ----------------------------------------------- | ----------------------- | --------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------- | -------- | ----------------------------------------- |
| Baseline verification                       | Earlier backend failures; new staged test setup | Yes                     | No                    | Finish deterministic test setup                                            | Verify staged changes                                        | None                         | P1       | **CRITICAL:** establish reliable baseline |
| Auth/session lifecycle                      | Generation checks partially implemented         | Yes                     | No                    | Preserve session architecture                                              | Complete cross-generation request/refresh protection         | None                         | P2       | **CRITICAL**                              |
| Auth failure classification                 | Improved client handling; needs tests           | Yes                     | No                    | Distinguish infrastructure errors from invalid credentials where necessary | Preserve retryable session state                             | None                         | P2       | **CRITICAL**                              |
| Google/Facebook UI                          | Shared controls now on both auth pages          | Yes                     | No                    | None planned                                                               | Verify availability, linking and callbacks                   | None                         | P2       | **REQUIRED:** verify, do not rebuild      |
| Passwords/rate limits/environment           | Implemented                                     | Yes                     | No                    | Regression tests                                                           | Accurate errors                                              | None                         | P2       | **REQUIRED:** preserve                    |
| RBAC/ownership                              | Implemented server-side                         | Yes                     | No                    | Extend checks to replies/likes                                             | Consistent authorized actions                                | None                         | P2–4     | **CRITICAL**                              |
| Post CRUD/slugs/deletion                    | Implemented                                     | Yes                     | No                    | Preserve contracts                                                         | Fix stale loads, editor gating, detail actions               | None until likes             | P3       | **REQUIRED**                              |
| Pagination                                  | Implemented; race/boundary gaps                 | Yes                     | No                    | Preserve limits/order                                                      | Pending state, stale-response rejection, valid-page recovery | None                         | P3–4     | **REQUIRED**                              |
| Comment CRUD                                | Implemented, currently permanent delete         | Yes                     | No                    | Extend query/delete semantics for threads                                  | Correct fetch/mutation states                                | Reply/tombstone fields       | P4       | **REQUIRED**                              |
| Replies                                     | Absent                                          | No                      | Yes                   | Parent validation, reply retrieval/creation                                | Thread grouping/composer/actions                             | `parentComment`, `deletedAt` | P4       | **APPROVED ENHANCEMENT**                  |
| Post likes                                  | Absent                                          | No                      | Yes                   | Atomic like/unlike and summaries                                           | Like button/count/state                                      | `Post.likedBy`               | P4       | **APPROVED ENHANCEMENT**                  |
| Comment/reply likes                         | Absent                                          | No                      | Yes                   | Same strategy as posts                                                     | Shared like controls                                         | `Comment.likedBy`            | P4       | **APPROVED ENHANCEMENT**                  |
| Admin user editing                          | Provider-only/protected-admin gaps remain       | Yes                     | No                    | Existing restrictions preserved                                            | Changed-field payloads and restriction feedback              | None                         | P5       | **REQUIRED**                              |
| Admin totals                                | Existing totals                                 | Yes                     | No                    | Exclude tombstones; include live replies                                   | Accurate labels/help text                                    | None additional              | P5       | **REQUIRED**                              |
| Admin comments                              | Existing flat moderation                        | Yes                     | Replies               | Include reply context                                                      | Comment/reply identification                                 | None additional              | P5       | **REQUIRED**                              |
| Notifications                               | Implemented; synchronization gaps remain        | Bonus                   | Yes                   | Add reply notification type                                                | Correct races and lifecycle                                  | Notification enum extension  | P6       | **APPROVED ENHANCEMENT**                  |
| Shared architecture                         | New hooks/DataGrid are partial                  | No                      | No                    | None                                                                       | Harden and reuse; avoid duplicate abstractions               | None                         | P7       | **UI REDESIGN**                           |
| Home/navigation                             | Generic composition                             | Requested frontend      | No                    | None                                                                       | Full shell/hero/feed redesign                                | None                         | P8       | **UI REDESIGN**                           |
| Cards/article/comments                      | Basic presentation                              | Requested frontend      | Replies/likes         | Use approved summaries                                                     | Full composition rewrite                                     | Already covered              | P8       | **UI REDESIGN**                           |
| Forms/personal pages                        | Styled but generic                              | Requested frontend      | No                    | None                                                                       | Shared polished forms/layout                                 | None                         | P8       | **UI REDESIGN**                           |
| Admin shell/tables                          | Existing capability; weak presentation          | Yes / redesign          | No                    | None additional                                                            | Full dashboard/sidebar/table redesign                        | None                         | P8       | **UI REDESIGN**                           |
| States/accessibility/mobile                 | Partial                                         | Requested frontend      | No                    | None                                                                       | Skeletons, stable refresh, errors, focus, responsive layouts | None                         | P9       | **UI REDESIGN**                           |
| Search/card comment counts                  | Unsupported today                               | No                      | No                    | No change planned                                                          | Omit controls/counters                                       | None                         | Deferred | **OPTIONAL**                              |
| Images/categories/bookmarks/social features | Unsupported                                     | No                      | No                    | None                                                                       | Remove or simplify reference elements                        | None                         | Excluded | **DO NOT IMPLEMENT**                      |

**4. Target Architecture**

Preserve the existing backend flow:

`Express routes → validation/auth/ownership middleware → controllers → services → Mongoose → serializers`

Extend it with:

- Reply methods in the existing comments service/controller.
- A small like service/controller shared by post and comment routes.
- Additional computed DTO fields.
- A reply notification branch in the existing notification service.

Preserve the frontend flow:

`AuthProvider → NotificationProvider → router/layouts → pages → existing API client`

Frontend changes:

- Complete the existing request/mutation abstractions.
- Extract reusable domain components.
- Rewrite presentation markup around those boundaries.
- Keep auth and notification providers mounted across navigation.
- Add optional authentication to public reads that return viewer-specific liked state.

Compatibility rules:

- Existing CRUD URLs and request fields remain valid.
- New response fields are additive.
- Existing comment listing retains its flat default; the redesigned thread view opts into a new query mode.
- Existing comment creation remains top-level.
- The approved reply feature changes deletion storage semantics, explicitly documented in Sections 6 and 15.

**5. Backend Implementation Plan**

| Phase                           | Backend work                                                                                                                                                            | Models/services/controllers/routes/middleware                                                                 | Tests and exit condition                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **1 — Critical requirements**   | Verify every mandatory capability; complete isolated test configuration                                                                                                 | Test configuration only initially                                                                             | Repeatable tests independent of developer OAuth settings                     |
| **2 — Authentication/security** | Verify JWT, refresh, OAuth, hashing, origin checks and rate limits; preserve infrastructure failures as server errors rather than falsely reporting invalid credentials | Auth/access-session services and authentication middleware only where a reproduced defect requires correction | Auth/RBAC tests pass; no security weakening                                  |
| **3 — Posts**                   | Preserve validation, author ownership, stable slugs, soft delete and pagination                                                                                         | Existing post service/controller/routes                                                                       | Post CRUD and deletion visibility tests pass                                 |
| **4 — Comments/replies/likes**  | Add one-level reply endpoints, tombstone deletion, paginated thread reads and atomic like operations                                                                    | Comment/Post models; comment and like services/controllers; routes; validators; serializers; ownership checks | Enhancement tests pass, including concurrency and foreign-resource rejection |
| **5 — Admin**                   | Include live replies in moderation/counts; exclude deleted comment content                                                                                              | Admin/comment services and serializers                                                                        | Counts and moderation match documented semantics                             |
| **6 — Socket.io**               | Add reply notifications while preserving persistence and recipient authorization                                                                                        | Notification model/service; existing socket server                                                            | Recipient isolation, persistence and no-duplicate tests pass                 |
| **7–9 — Frontend work**         | No decorative backend expansion                                                                                                                                         | Existing contracts consumed                                                                                   | API compatibility remains intact                                             |
| **10 — Final verification**     | Run full regression, index verification and migration checks                                                                                                            | Tests/scripts/docs                                                                                            | All mandatory checks pass                                                    |

Current test setup needs a specific correction check: deleting OAuth environment keys may allow `dotenv` to reload them from `.env`. Tests must establish explicit disabled-provider values before application imports and prevent developer configuration from repopulating them.

Do not change production password hashing or rate limits to make tests faster.

**6. Replies Implementation Plan**

**Decision:** extend the existing Comment collection; support exactly one reply level.

| Aspect                   | Specification                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| Current model            | `content`, `post`, `author`, timestamps                                                    |
| New relationship         | `parentComment: ObjectId \| null`, referencing Comment; default `null`; immutable          |
| New deletion field       | `deletedAt: Date \| null`; default `null`                                                  |
| Top-level creation       | Existing `POST /posts/:postId/comments` with `{ content }`                                 |
| Reply creation           | New `POST /comments/:id/replies` with `{ content }`                                        |
| Reply retrieval          | New `GET /comments/:id/replies?page&limit`                                                 |
| Editing/deleting replies | Existing `PATCH/DELETE /comments/:id`                                                      |
| Thread retrieval         | Existing post-comments endpoint gains `view=threads`                                       |
| Nesting prevention       | Reply parent must have `parentComment === null`; a reply cannot be used as a parent        |
| Same-post enforcement    | Server derives reply `post` from the parent; client cannot supply another post             |
| Ownership                | Creator or admin may edit/delete; parent author has no ownership over other users’ replies |

Creation rules:

1. Validate the parent ID and content.
2. Require an authenticated, active user.
3. Require an existing, undeleted top-level parent.
4. Require its post to be active.
5. Create the reply using server-derived author, post and parent.
6. Trigger the notification only after persistence.

Deletion rules:

- Replace deleted content with the literal placeholder `[deleted]`.
- Set `deletedAt` and clear its likes atomically.
- Do not retain the original text for restoration.
- A deleted top-level comment remains a noninteractive placeholder in thread mode so replies stay attached.
- Deleted replies disappear from the reply list.
- Deleted comments/replies cannot be edited or liked.
- New replies cannot be started on deleted parents.
- A reply already being created concurrently with parent deletion may complete; the tombstone preserves its relationship.
- No restore or purge feature is introduced.

This deliberately replaces physical comment deletion with text-cleared tombstones. Existing callers still receive the existing successful delete envelope and `id`; `deletedAt` may be added.

Query behavior:

- Default `GET /posts/:postId/comments` returns live comments/replies as a flat list, preserving its existing shape.
- `view=threads` returns top-level records, including deleted placeholders, oldest first with `_id` as tie-breaker.
- `meta.total` in thread mode counts thread roots, including placeholders.
- Each root contains `replyCount`, counting live replies.
- Replies load only when expanded, paginated oldest first.
- Compute root reply counts in one grouped query for the current page.
- Do not query once per comment or return unbounded embedded reply arrays.

Discussion count:

- Add `commentCount` to the **post-detail** DTO: live top-level comments plus live replies.
- Do not add card comment counts or list-wide comment aggregation in this release.

Dependencies: Phase 2 authorization, Phase 3 active-post behavior.

Risks: changing delete expectations, incorrect nesting, orphaned display, misleading totals, query fan-out.

Acceptance: one-level enforcement, same-post relationship, correct ownership, preserved replies after parent deletion, paginated retrieval and accurate live counts.

**7. Likes Implementation Plan**

**Model choice**

| Option                         | Benefits                                                                                                    | Costs                                                                             | Decision                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------ |
| `likedBy` array on each target | Minimal schema extension; atomic updates on the target; straightforward count/state; no orphan Like records | Arrays grow with popularity; unsuitable for an indefinitely large social platform | **Choose for this assignment**             |
| Separate Like collection       | Independent scaling; compound uniqueness; efficient liker-oriented queries                                  | Additional model, indexes, aggregation and cleanup behavior                       | Defer until demonstrated scale requires it |

Use `likedBy: ObjectId[]` on Post and Comment, defaulting to `[]`.

Use `$addToSet` to like and `$pull` to unlike. MongoDB supports single-document atomic updates, and these operators avoid a read-modify-save duplicate race. [MongoDB atomicity](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/), [array update operators](https://www.mongodb.com/docs/v8.0/reference/operator/update-array/).

**Endpoints**

| Action               | Endpoint                    | Body |
| -------------------- | --------------------------- | ---- |
| Like post            | `PUT /posts/:id/like`       | `{}` |
| Unlike post          | `DELETE /posts/:id/like`    | `{}` |
| Like comment/reply   | `PUT /comments/:id/like`    | `{}` |
| Unlike comment/reply | `DELETE /comments/:id/like` | `{}` |

Return the existing success envelope containing:

`{ id, likeCount, likedByMe }`

Rules:

- Authenticated users, including admins, act only as themselves.
- No `userId` is accepted from the client.
- Repeated PUT or DELETE requests are idempotent.
- Self-liking is allowed; no special rule is needed.
- Deleted posts cannot be liked or unliked.
- Deleted comments and comments belonging to deleted posts cannot be liked/unliked, including by admins.
- Like changes must not alter editorial `updatedAt` timestamps.
- No reaction types, liker directory, like history or notifications.

Read responses:

- Add `likeCount` and `likedByMe` to post/comment DTOs.
- Anonymous reads return `likedByMe: false`.
- Reuse `optionalAuthenticate` on public read routes; an invalid supplied token is not silently accepted as anonymous.
- Never expose the `likedBy` array or populate liker accounts.
- Treat missing arrays on old documents as empty.

Frontend behavior:

- One shared `LikeButton`.
- Anonymous interaction offers login without performing a mutation.
- Disable the specific button during its request.
- Update count/state from the server response.
- Avoid speculative optimistic increments in this version.
- Reject stale completions after navigation/account changes.
- Refetch when revisiting a page; no real-time like-count synchronization.

Dependencies: authentication, active/deleted resource checks and reply model.

Acceptance: duplicate/concurrent likes by one user count once; two users count twice; unlike affects only the caller; state survives reload; inaccessible targets are rejected.

**8. Socket.io Plan**

Keep the existing persistent notification infrastructure.

| Trigger               | Recipient                              | Notification           |
| --------------------- | -------------------------------------- | ---------------------- |
| New top-level comment | Post owner, excluding actor            | Existing `NEW_COMMENT` |
| New reply             | Parent-comment author, excluding actor | New `NEW_REPLY`        |
| Like/unlike           | Nobody                                 | None                   |
| Edit/delete           | Nobody                                 | None                   |

A reply produces only the reply notification. Do not additionally notify the post owner unless they are the parent author.

Implementation:

- Extend the notification type enum with `NEW_REPLY`.
- Reuse existing actor/post/comment references; `comment` points to the newly created reply.
- Retain the unique recipient/type/comment index.
- Keep existing socket event names; carry the new type through `notification:new`.
- Continue navigating to the post slug, without adding comment-location/deep-link APIs.
- Preserve comment/reply success if notification persistence or delivery fails.

Complete frontend reliability:

- Scope requests, mutations and handlers to an authentication generation.
- Discard responses invalidated by newer events or mutations.
- Deduplicate event IDs before changing list/count state.
- Keep REST authoritative for unread totals.
- Preserve later-page selection.
- Reconcile after reconnect and focus.
- Clear/disconnect on logout or invalid sessions.
- Prevent unlimited refresh/reconnect loops.
- Reauthenticate the connection when its token changes.

No Redis adapter, queue, outbox or separate notification center is planned. Retain the documented single-process and comment/notification write-gap limitations.

**9. Frontend Redesign Plan**

| Screen                    | Full redesign specification                                                                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home**                  | Reference-style branded navbar; spacious split hero; prominent blue CTA and secondary Explore action; static decorative illustration; three latest post cards              |
| **Post listing**          | Compact page heading; vertically arranged post rows with strong title/excerpt hierarchy, author/date and like controls; pagination; no unsupported category/search sidebar |
| **Post detail**           | Clear title and metadata header; authorized actions; like control; readable article width; integrated discussion with replies                                              |
| **Login/register**        | Matching branded cards, real headings, consistent fields, provider buttons, validation and pending states                                                                  |
| **Create/edit**           | One polished title/content form; spacious text area and consistent action footer; no image/category/rich-text controls                                                     |
| **My Posts**              | Lightweight identity header and compact management rows, reflecting the reference profile composition without unsupported tabs                                             |
| **Account**               | Read-only identity plus existing provider connections; truthful availability and linking feedback                                                                          |
| **Admin dashboard**       | Navy sidebar, compact top navigation, three prominent metric cards and management shortcuts                                                                                |
| **Admin users**           | Name/email, role, status, joined date and action menu; polished create/edit forms                                                                                          |
| **Admin posts**           | Title, author, created date, Active/Deleted badge and supported actions/filter                                                                                             |
| **Admin comments**        | Comment/reply label, content preview, post, parent context, author/date and moderation actions                                                                             |
| **Notifications**         | Restyled existing popover with unread styling, read controls, stable loading and connection feedback                                                                       |
| **403/404/session error** | Branded, concise explanation and useful recovery action                                                                                                                    |

Reference adaptation:

- Replace photo-heavy card regions with well-composed text-first cards, not empty image placeholders.
- Label the home collection **Latest posts**, not Featured.
- Keep likes and reply actions because they are now approved.
- Use initials avatars.
- Remove unsupported filters and controls rather than rendering decorative buttons that do nothing.

**10. Design System**

| Token/convention     | Target                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Public maximum width | 1152px                                                                                       |
| Admin workspace      | Up to approximately 1280px, plus deliberate sidebar allocation                               |
| Article width        | 720px                                                                                        |
| Page gutters         | 16px mobile, 24px tablet, 32px desktop                                                       |
| Section spacing      | 24/32/48px                                                                                   |
| Card padding         | 16px compact, 24px standard                                                                  |
| Background           | `#F8FAFC`                                                                                    |
| Card surface         | White                                                                                        |
| Primary              | Blue `#2563EB`                                                                               |
| Supporting accent    | Restrained indigo                                                                            |
| Text                 | Dark slate with readable muted slate                                                         |
| Sidebar              | Deep navy                                                                                    |
| Borders              | Subtle gray-blue; explicit color on all dividers                                             |
| Radius               | Approximately 12px cards; 8px controls                                                       |
| Shadows              | Minimal; stronger only for floating surfaces                                                 |
| Font                 | Existing system sans-serif stack                                                             |
| Type scale           | 12px secondary metadata, 14px controls, 16px body, 18px article; responsive 24–48px headings |
| Line height          | Approximately 1.5 interface/body; 1.7 article                                                |
| Field spacing        | 8px label/input relation; 16–24px between fields                                             |
| Controls             | Consistent 40px standard height; larger touch area for small icon actions                    |
| Motion               | Short restrained transitions; reduced-motion support                                         |

Define these centrally through existing CSS variables and reusable component variants. Avoid per-page color/radius systems.

**11. Component Architecture**

Use the existing application structure rather than creating four duplicative shells.

| Component/layout                   | Responsibility                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `MainLayout`                       | Shared public/authenticated navbar, footer and container                     |
| `AuthLayout`                       | Auth-specific composition beneath the common shell                           |
| `AdminLayout`                      | Admin sidebar, header, mobile Sheet and workspace                            |
| `Header` / `MobileNavigation`      | Shared public/authenticated navigation                                       |
| `HeroSection`                      | Home composition                                                             |
| `PageHeading`                      | Consistent page heading/action area                                          |
| `PostCard`                         | Home card and listing-row variants                                           |
| `PostMeta`                         | Author initials/name/date                                                    |
| `PostActions`                      | Authorized edit/delete controls                                              |
| `PostForm`                         | Shared create/edit fields                                                    |
| `LikeButton`                       | Post/comment/reply like interaction                                          |
| `CommentSection`                   | Thread pagination and mutation coordination                                  |
| `CommentItem`                      | Root comment and tombstone presentation                                      |
| `ReplyList`                        | Expandable paginated reply group                                             |
| `CommentForm`                      | Shared top-level/reply/editor field treatment                                |
| `FormField`                        | Label/help/error association                                                 |
| `DataGrid`                         | Existing listing abstraction, hardened for stale requests and stable refresh |
| `States` / `LoadingSkeletons`      | Reusable loading/error/empty presentation                                    |
| Existing confirmation/edit dialogs | Destructive actions and editing                                              |
| Existing `StatCard`                | Dashboard metrics                                                            |

Do not create separate ReplyItem/ReplyForm implementations if CommentItem/CommentForm variants suffice.

Harden existing hooks:

- `useQuery`: request identity, unmount safety, initial versus refresh state, stale-response rejection.
- `useMutation`: pending guard, generation-aware completion and handled rejection paths.
- `DataGrid`: valid-page recovery, coordinated dependency/page reset and retained content during refresh.

Do not create a second competing query abstraction.

**12. Page/Route Map**

| Route                   | Access                           |
| ----------------------- | -------------------------------- |
| `/`                     | Public home                      |
| `/posts`                | Public paginated feed; new route |
| `/posts/:slug`          | Public article/discussion        |
| `/login`, `/register`   | Public authentication            |
| `/auth/callback`        | OAuth completion                 |
| `/posts/new`            | Authenticated                    |
| `/posts/:id/edit`       | Owner/admin; API still enforces  |
| `/dashboard`            | Authenticated My Posts           |
| `/account`              | Authenticated account/linking    |
| `/admin`                | Admin                            |
| `/admin/users`          | Admin                            |
| `/admin/users/new`      | Admin                            |
| `/admin/users/:id/edit` | Admin                            |
| `/admin/posts`          | Admin                            |
| `/admin/comments`       | Admin                            |
| `/403`                  | Forbidden state                  |
| `*`                     | Not found                        |

Replies and likes are inline interactions, not new frontend pages.

**13. API-to-UI Mapping**

All paths below are relative to `/api/v1`.

| UI                           | Endpoint                                                            |
| ---------------------------- | ------------------------------------------------------------------- |
| Home/latest feed             | `GET /posts?page=1&limit=10`; display three                         |
| Post listing/My Posts        | `GET /posts?page&limit[&authorId]`                                  |
| Article                      | `GET /posts/slug/:slug`                                             |
| Editor                       | `GET /posts/:id`, `POST /posts`, `PATCH /posts/:id`                 |
| Delete post                  | `DELETE /posts/:id`                                                 |
| Post like button             | **New:** `PUT/DELETE /posts/:id/like`                               |
| Thread roots                 | **Extended:** `GET /posts/:postId/comments?view=threads&page&limit` |
| Legacy flat comments         | Existing endpoint without `view`, or `view=flat`                    |
| Add root comment             | `POST /posts/:postId/comments`                                      |
| Expand replies               | **New:** `GET /comments/:id/replies?page&limit`                     |
| Add reply                    | **New:** `POST /comments/:id/replies`                               |
| Edit/delete comment or reply | `PATCH/DELETE /comments/:id`                                        |
| Comment/reply like button    | **New:** `PUT/DELETE /comments/:id/like`                            |
| Auth forms                   | `POST /auth/register`, `/auth/login`                                |
| Session lifecycle            | Existing refresh/logout/me endpoints                                |
| Provider controls            | `/auth/providers`, provider initiation/callback/link routes         |
| Admin dashboard              | `GET /admin/stats`                                                  |
| Admin users/forms            | Existing `/users` endpoints                                         |
| Admin posts                  | `GET /admin/posts?page&limit&status`                                |
| Admin comments/replies       | `GET /admin/comments?page&limit[&postId]`                           |
| Notification popover         | Existing list/read-one/read-all endpoints                           |

New mutations reuse `trustedOrigin`, `authenticate`, validation and centralized errors. Likes do **not** use ownership middleware because users may like others’ content.

**14. shadcn/ui Mapping**

| UI element                                      | Component                             |
| ----------------------------------------------- | ------------------------------------- |
| Hero CTAs, submit, reply and like controls      | Button                                |
| Auth/admin/post fields                          | Input, Textarea, Label                |
| Home cards, auth panels, mobile management rows | Card                                  |
| Initials                                        | Avatar                                |
| Roles, Active/Deleted, Reply labels             | Badge                                 |
| Desktop admin lists                             | Table                                 |
| Account/row/post action menus                   | DropdownMenu                          |
| Comment editing                                 | Dialog                                |
| Delete/deactivate confirmations                 | AlertDialog                           |
| Mobile navigation/sidebar                       | Sheet                                 |
| Initial data loading                            | Skeleton                              |
| Errors and persistent notices                   | Alert                                 |
| Notifications                                   | Popover                               |
| Success feedback                                | Sonner                                |
| Pagination                                      | Existing wrapper using shared buttons |
| Section separation                              | Separator                             |

Do not add Tabs solely to copy unsupported profile sections. Do not reinstall or regenerate existing primitives wholesale.

**15. Database Changes**

| Model        | Exact change                                                 | Compatibility                       | Indexes                                                |
| ------------ | ------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------ |
| Post         | `likedBy: ObjectId[]`, default `[]`, internal-only           | Old records read as zero likes      | No liker-array index needed                            |
| Comment      | `parentComment: ObjectId \| null`, default `null`, immutable | All existing comments remain roots  | `{ post:1, parentComment:1, createdAt:1, _id:1 }`      |
| Comment      | `deletedAt: Date \| null`, default `null`                    | Existing comments remain live       | `{ parentComment:1, deletedAt:1, createdAt:1, _id:1 }` |
| Comment      | `likedBy: ObjectId[]`, default `[]`, internal-only           | Old records read as zero likes      | No liker-array index                                   |
| Notification | Add `NEW_REPLY` to type enum                                 | Existing notifications remain valid | Reuse current indexes                                  |

Retain existing author/admin indexes. Review query plans before removing any existing index.

Serializer additions:

- Post: `likeCount`, `likedByMe`; detail additionally `commentCount`.
- Comment: `parentCommentId`, `deletedAt`, `replyCount`, `likeCount`, `likedByMe`.
- Tombstone roots: placeholder content; frontend suppresses author/actions and retains reply grouping.
- Notification: existing shape with new type value.

Migration:

1. Add an idempotent backfill script.
2. Set new fields only where absent.
3. Preserve IDs, authorship, slugs, timestamps and existing content.
4. Build indexes through the existing index script.
5. No migration of previously hard-deleted comments is possible or required.
6. Deploy backend/frontend together during a short maintenance window.

Rollback limitation: once replies and tombstones exist, an old backend is not a safe rollback target. Take a backup before enabling the enhancement and use a compatibility-aware rollback or forward fix.

**16. File-Level Change Plan**

Paths use the actual repository structure; listed new files are intentional additions.

| Phase  | Modify/reuse                                                                                                                                                                                         | Add                                                                                                                                      |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | `backend/jest.config.cjs`, `backend/src/tests/setEnvVars.ts`, `backend/src/tests/setup.ts`; current tests                                                                                            | Baseline tests only where missing                                                                                                        |
| **2**  | `frontend/src/api/client.ts`, `context/AuthContext.tsx`, `routes/Guards.tsx`, `components/auth/SocialAuthButtons.tsx`; `backend/src/middleware/authenticate.ts` if error classification requires it  | Targeted auth regression tests                                                                                                           |
| **3**  | `frontend/src/pages/BlogPages.tsx`, `UserPages.tsx`, `components/Pagination.tsx`; existing post tests                                                                                                | Post flow tests                                                                                                                          |
| **4**  | `backend/src/models/{post,comment}.model.ts`, comment/post services/controllers/routes, `validators/comment.schemas.ts`, `utils/serializers.ts`, `middleware/ownership.ts`; frontend API/types/pages | `backend/src/services/likes.service.ts`, `controllers/likes.controller.ts`, reply/like tests; frontend `LikeButton` and reply components |
| **5**  | `backend/src/services/admin.service.ts`, `comments.service.ts`; `frontend/src/pages/AdminPages.tsx`; admin tests                                                                                     | Focused admin presentation components                                                                                                    |
| **6**  | Notification model/service, existing socket code/tests; frontend NotificationContext, socket client, NotificationBell/types                                                                          | Reply-notification test cases                                                                                                            |
| **7**  | Existing `hooks/useQuery.ts`, `useMutation.ts`, `components/DataGrid.tsx`; grouped page modules                                                                                                      | AuthLayout, FormField, PostMeta, PostActions, PostForm, CommentSection/CommentItem/ReplyList, shared formatting/permissions utilities    |
| **8**  | Layouts, Header/MobileNavigation, page markup, PostCard/StatCard, `styles/global.css`, `routes/AppRouter.tsx`                                                                                        | `pages/HomePage.tsx`, HeroSection                                                                                                        |
| **9**  | States, dialogs, pagination, NotificationBell, DataGrid, `App.tsx`, frontend manifest/root lockfile                                                                                                  | `components/LoadingSkeletons.tsx`, `components/ui/sonner.tsx`                                                                            |
| **10** | Tests, `README.md`, `Design-specs.md`, `backend/scripts/create-indexes.ts`                                                                                                                           | `backend/scripts/migrate-discussion.ts`                                                                                                  |

Rewrite substantially:

- Page presentation in `BlogPages`, `AuthPages`, `UserPages`, `AdminPages`, `StatusPages`.
- Main/Admin layouts and header composition.
- Post cards, discussion composition and management table presentation.

Reuse and extend:

- UI primitives, initials avatars, SafeText, confirmation/edit dialogs.
- API wrappers, router conventions, contexts and existing hooks.

Preserve:

- Password/token/OAuth/session architecture.
- Existing RBAC and post business rules.
- Environment files and user-staged work.
- Existing socket infrastructure.

**17. Implementation Sequence**

1. **Phase 1 — Critical requirements:** reconcile the current staged implementation, repair deterministic test configuration, establish baseline.
2. **Phase 2 — Auth/security:** complete generation-owned refresh/request handling; verify OAuth, hashing, origins, rate limits and RBAC.
3. **Phase 3 — Posts:** fix stale loads, editor gating, detail actions and pagination boundaries.
4. **Phase 4 — Comments/replies/likes:** introduce model defaults/indexes, reply/query/deletion behavior, like services, API/types and basic functional UI.
5. **Phase 5 — Admin:** correct provider-only user editing, protected-admin controls, counts and reply moderation.
6. **Phase 6 — Socket.io:** fix synchronization, then add reply notifications.
7. **Phase 7 — Frontend architecture:** harden existing abstractions and extract shared domain components.
8. **Phase 8 — High-fidelity redesign:** implement design tokens, shells and every target screen.
9. **Phase 9 — Responsive/UX polish:** skeletons, stable refresh, empty/error states, toasts, focus, mobile threads and tables.
10. **Phase 10 — Final verification:** full tests/builds, migration rehearsal, role-based demo, visual review and documentation.

Each phase requires its relevant tests before proceeding. Backend enhancement behavior must stabilize before final discussion/like UI styling.

**18. Testing Strategy**

| Phase | Required tests                                                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1    | Test environment ignores local OAuth secrets; isolated MongoDB; staged code typechecks                                                              |
| P2    | Register/login/logout; refresh reuse; stale completion; account switch; old-request retry; OAuth linking/state; rate limits; hashing; route guards  |
| P3    | Create/read/edit/delete; ownership; stable slug; deleted-post visibility; pagination and last-row deletion                                          |
| P4    | Root/reply CRUD; cross-post/deeper nesting rejection; tombstones; reply counts; likes/unlikes; duplicate/concurrent likes; deleted-target rejection |
| P5    | Provider-only user edits; protected/self-admin restrictions; live comment/reply totals; moderation on retained content                              |
| P6    | Persistence before delivery; no self-notification; reply recipient; duplicate events; REST/event races; reconnect; logout; cross-recipient denial   |
| P7    | Hook request sequencing, cancellation/unmount handling, DataGrid filter/page reset, mutation rejection handling                                     |
| P8    | Form behavior, page navigation, ownership-aware controls and real DTO rendering                                                                     |
| P9    | Loading/error/empty exclusion; retry; keyboard/focus; mobile overflow; long content; toast behavior                                                 |
| P10   | Full existing suites, build, migration idempotency, end-to-end role scenarios                                                                       |

Important session test: a refresh promise must belong to its initiating generation. A newer account must not join an older refresh promise and accept its payload merely because the newer caller supplied its own generation.

Similarly, stamp outgoing requests with their generation at dispatch; do not infer ownership only when a delayed 401 returns.

Use existing Jest/Supertest and Vitest/Testing Library. Do not require a new test framework.

**19. Acceptance Criteria**

| Feature             | Complete when                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Authentication      | Valid auth works; invalid sessions fail; transient errors are retryable; no stale token restoration or cross-account request replay |
| OAuth               | Both providers appear on both auth screens; enabled/disabled/error states are distinct; configured flows and explicit linking work  |
| RBAC                | Users mutate only their content; admins manage supported resources; backend rejects bypass attempts                                 |
| Posts               | CRUD works; validation remains; slugs stay stable; deletion hides content and interactions                                          |
| Root comments       | CRUD works with correct ownership; plain text remains safe; pagination is stable                                                    |
| Replies             | Same-post, one-level only; users own their replies; admins moderate; deleted parents preserve live replies                          |
| Post likes          | Auth required; count changes once; repeat PUT/DELETE is safe; reload preserves state; deleted posts reject interaction              |
| Comment/reply likes | Same guarantees; tombstones/deleted-post comments reject interaction                                                                |
| Admin               | User lifecycle works; dates/status/actions are correct; totals exclude tombstones and include live replies                          |
| Notifications       | Correct recipient only; no self/like notifications; persistence and reconnect recovery work                                         |
| Data loading        | No empty-before-load or contradictory empty/error state; stale responses cannot replace newer data                                  |
| Forms               | Validation is connected to fields; pending actions cannot double-submit; failure retains input                                      |
| Redesign            | All screens share the reference-inspired composition, colors, spacing and component treatment                                       |
| Responsive          | No page-wide overflow at 320/375/768/1024/1440px; replies remain readable with one small indentation                                |
| Accessibility       | Keyboard operation, focus return, headings, labels and meaningful button names work                                                 |

**20. Risk Register**

| Risk                                          | Mitigation                                                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Staged work overwritten                       | Treat current files as baseline; review changes before edits; no reset/regeneration                                     |
| Auth-generation fix remains incomplete        | Generation-owned refresh promises and dispatch-stamped requests; deferred-response tests                                |
| Test environment reloads local OAuth settings | Explicit test-only values before dotenv/application imports                                                             |
| RBAC bypass through new endpoints             | Reuse authentication/origin validation; derive author and reply post server-side                                        |
| Infinite/cross-post replies                   | Immutable parent; reject parent that is itself a reply; derive post                                                     |
| Parent deletion destroys conversation         | Text-cleared tombstone; preserve children                                                                               |
| Deleted content leaks                         | All serializers/query modes honor deletion; no original text retained                                                   |
| Duplicate likes                               | Atomic `$addToSet`; no read-modify-save                                                                                 |
| Array growth                                  | Accepted take-home-scale tradeoff; never expose/populate liker arrays; migrate to Like collection only if scale demands |
| Stale like state                              | Server-authoritative mutation responses; generation/request guards; refetch on revisit                                  |
| Comment query fan-out                         | Page-bounded grouped reply-count query; replies fetched on expansion                                                    |
| Dashboard count regression                    | Explicit live-root/live-reply semantics and integration tests                                                           |
| Concurrent post deletion and child mutation   | Check active post; all reads hide deleted-post discussion; document that cross-document writes are not transactional    |
| Notification double delivery/count drift      | Unique persistence index, event deduplication and authoritative REST reconciliation                                     |
| Socket refresh loops                          | Bounded recovery and correct invalid-session clearing                                                                   |
| Shared hooks swallow or leak errors           | Test caller behavior and handle all rejected mutations                                                                  |
| Redesign breaks working calls                 | Separate presentation extraction from contract changes; payload regression tests                                        |
| Rollback loses thread meaning                 | Backup and compatibility-aware rollout; no old-backend rollback after feature writes                                    |

No transactions are introduced solely to eliminate every cross-document deletion race. A mutation racing a post deletion may leave hidden retained data; it must not make deleted content publicly accessible.

**21. Features Explicitly Not Implemented**

- Post/cover image uploads or mandatory images.
- Categories, tags or featured-content administration.
- Bookmarks or saved collections.
- Followers, following, messaging or social profiles.
- Infinite reply nesting.
- Emoji reactions, dislikes or reputation.
- Like notifications.
- Dedicated notification-center page.
- Rich text, drafts, autosave or publishing workflow.
- Full profile editing or avatar upload.
- Forgot-password or configurable remember-me flows.
- Search, ranking or recommendations.
- Analytics charts, growth percentages or invented counters.
- Redis, queues, event sourcing or new state-management frameworks.
- Post/comment restoration or moderation history.

**22. Final Assignment Compliance Checklist**

The following maps every mandatory item listed in your attachment. These are planned outcomes, not claims that implementation has finished.

| Requirement                          | Coverage                                           |
| ------------------------------------ | -------------------------------------------------- |
| Registration, login, logout          | P2, P8, P10                                        |
| JWT access tokens                    | Preserve and test in P2                            |
| Refresh tokens                       | Complete lifecycle protection in P2                |
| Authentication rate limiting         | Preserve; dedicated P2 tests                       |
| Password hashing                     | Preserve and verify in P2                          |
| Environment variable usage           | Preserve; isolate tests in P1                      |
| Google OAuth                         | Verify P2; redesign P8                             |
| Facebook OAuth                       | Verify P2; redesign P8                             |
| Admin and Regular User roles         | Preserve P2                                        |
| API-level RBAC                       | P2–5 tests                                         |
| Admin user management                | P5; existing protected-admin constraints retained  |
| Admin post management                | P3, P5                                             |
| Users manage only their posts        | P2–3                                               |
| Post create/read/update/delete       | P3                                                 |
| Title/content/author/timestamps      | Preserve P3                                        |
| Post validation                      | Preserve and test P3                               |
| URL-friendly slug                    | Backend-generated stable slug retained             |
| MongoDB/Mongoose                     | Existing architecture retained                     |
| Post soft deletion                   | Preserve P3; interactions respect it               |
| Comment-on-post and comment CRUD     | P4                                                 |
| Own-comment edit/delete              | P4                                                 |
| Admin comment management             | P4–5                                               |
| Mongoose post/comment relationships  | Preserve and extend P4                             |
| Dedicated React admin panel          | P5, P8                                             |
| Auth/role-protected admin routes     | P2, P10                                            |
| Total Users/Posts/Comments           | P5 with documented counting semantics              |
| Express Router                       | Existing routes extended                           |
| Reusable middleware                  | Existing auth/origin/validation/ownership reused   |
| Centralized errors                   | Existing envelope preserved                        |
| Service layer/separation of concerns | Existing structure retained                        |
| Clean folder structure               | P7, P10                                            |
| Indexing                             | P4 migration/index script; P10 verification        |
| Pagination                           | Posts, roots, replies, admin and notifications     |
| Sensible population                  | Author/post projections only; no liker population  |
| Unit tests                           | Existing setup extended                            |
| Integration tests                    | Auth/CRUD/RBAC/replies/likes/admin/socket coverage |
| Jest or existing setup               | Jest/Supertest plus existing Vitest retained       |
| Functional React components          | Preserved throughout                               |
| React Hooks                          | Existing hooks completed/reused                    |
| Global authentication state          | AuthProvider preserved                             |
| Protected user/admin routes          | P2, P10                                            |
| Socket.io bonus                      | Existing feature completed and extended in P6      |
| Approved replies                     | P4, P6, P8                                         |
| Approved post/comment likes          | P4, P8                                             |

Live OAuth acceptance remains dependent on valid provider configuration and available test accounts; automated tests cannot substitute for the provider round trip.

**23. Final UI Fidelity Checklist**

- [ ] Branded navbar with clear active navigation and blue primary CTA.
- [ ] Reference-inspired split hero and latest-post section.
- [ ] Cohesive cards with strong title/excerpt/metadata hierarchy.
- [ ] Structured listing rows with real likes.
- [ ] Matching login/register composition and provider buttons.
- [ ] Polished title/content editor.
- [ ] Readable article width and clear authorized actions.
- [ ] Realistic comment rows, likes, reply actions and one-level groups.
- [ ] Lightweight identity/My Posts composition.
- [ ] Navy admin sidebar and deliberate workspace header.
- [ ] Three prominent real metric cards.
- [ ] Consistent admin tables, badges, dates and action menus.
- [ ] Mobile navigation and admin Sheet.
- [ ] Mobile table/card fallback and readable reply indentation.
- [ ] Shared typography, spacing, borders, radius and shadows.
- [ ] Skeletons resemble final content geometry.
- [ ] Empty/error/pending/success states are designed, not incidental.
- [ ] Unsupported screenshot controls are removed or replaced with honest visual equivalents.
- [ ] Populated desktop screenshots are compared directly with the reference.
- [ ] Mobile, keyboard and long-content behavior is reviewed separately.

The reference is a mockup board, not a responsive specification. Preserve its visual hierarchy while adapting image-dependent areas to the approved text-first data model.

**24. Definition of Done**

- [ ] Every mandatory checklist item is implemented or verified preserved.
- [ ] All staged work has been reconciled without accidental loss.
- [ ] Authentication, refresh, OAuth, rate limits and API RBAC pass regression tests.
- [ ] Posts retain stable slugs, validation, ownership and soft deletion.
- [ ] Replies enforce one level and preserve threads after parent deletion.
- [ ] Post/comment/reply likes are atomic, idempotent and private at the liker-ID level.
- [ ] Admin moderation and totals reflect live comments and replies correctly.
- [ ] Existing notifications and reply notifications pass persistence/privacy/recovery tests.
- [ ] Every target screen has received the full redesign.
- [ ] Loading/error/empty/pending/unauthorized states are verified.
- [ ] Responsive and keyboard checks pass.
- [ ] Migration is idempotent and index creation is verified.
- [ ] No unsupported controls or fabricated data remain.
- [ ] Typechecks, tests and production builds pass.
- [ ] README documents new endpoints, deletion/count semantics, migration and limitations.
- [ ] A two-user plus admin demonstration completes successfully.

Final verification commands:

```powershell
npm.cmd run typecheck --workspaces
npm.cmd test --workspaces
npm.cmd run build --workspaces
```

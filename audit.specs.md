**Recommendation: keep the existing application architecture and redesign its presentation layer.** The project already has React, Tailwind CSS, shadcn-style components, Lucide icons, authentication, administration, and persistent Socket.io notifications. It needs a cohesive visual design and several targeted UX fixes.

No application code was changed.

**1. Current project assessment**

I inspected the reference image, frontend pages/components/routes, API client, authentication and notification contexts, backend routes/controllers/services, MongoDB models, validation, authorization, socket implementation, and tests.

Two evidence limitations matter:

- I did not find the original assignment brief. The matrix below uses **your message as the requirements baseline**, supported by repository documentation. It is not a certification against an unseen assignment.
- Browser inspection covered the public home/error state, desktop login, and mobile registration/navigation. Authenticated and admin findings are based on source inspection; the development API was not running.

The existing [Design-specs.md](C:/Root/assessment/mern-blog-assignment/Design-specs.md) is outdated: it says the project lacks a component framework and notification implementation. Both now exist.

| Area             | Verified implementation                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| Frontend         | React 19, TypeScript, Vite, React Router                                                                       |
| Styling          | Tailwind 4, Vite integration, CSS theme variables, existing `components/ui` primitives                         |
| Forms            | React Hook Form/Zod for authentication and posts; local state/native validation for admin users and comments   |
| Authentication   | Email/password, Google/Facebook OAuth, explicit provider linking                                               |
| Sessions         | Memory-held access token, HttpOnly refresh cookie, rotating refresh sessions, backend reuse detection          |
| Authorization    | `USER`/`ADMIN`, backend ownership checks and admin overrides                                                   |
| Posts            | Public pagination, author filtering, create/edit, stable backend-generated slugs, soft deletion                |
| Comments         | Paginated plain-text comments, owner/admin editing and deletion                                                |
| Administration   | Statistics; user creation/editing/deactivation/reactivation; post and comment moderation                       |
| Notifications    | MongoDB persistence, authenticated Socket.io, unread count, read-one/read-all, pagination                      |
| Reusable UI      | Header, mobile navigation, cards, avatars, headings, statistics, pagination, states, confirmation/edit dialogs |
| Unsupported data | Post images, categories, likes, bookmarks, bios, profile images, drafts and analytics series                   |

Important data semantics to preserve:

- Post deletion hides the post; there is no restoration API.
- Comment deletion is permanent.
- User “deletion” means deactivation.
- Dashboard users include inactive accounts; posts count active posts; comments count comments on active posts.
- Public post DTOs provide excerpts, author names and dates, **not comment counts**.
- The comment-list response provides a total through pagination metadata.
- Comments are ordered oldest first.

Verification performed:

- **Both workspaces passed TypeScript checking.**
- **All 25 frontend tests passed.**
- The backend run reported an OAuth-provider expectation failure and a dashboard-test timeout. I interrupted the prolonged run; the full backend suite is **not verified passing**.
- The provider test expects Google to be disabled, but the test environment reports it enabled. Test configuration needs isolation from environment-dependent provider settings.
- Existing frontend tests primarily cover components and selected interactions; they do not establish comprehensive page-flow or visual coverage.

**2. Serious UI/UX audit**

The frontend is a **styled functional baseline**, but it does not yet achieve the reference’s visual identity or presentation consistency. It is closer in component infrastructure than in finished design.

| Area                  | Current finding                                                                                                      | Recommended correction                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Home layout           | Compact introductory heading and feed; no substantial hero composition or prominent hero CTAs                        | Introduce a deliberate landing section with blue/indigo accents, two clear CTAs, and latest posts |
| Visual identity       | Predominantly monochrome; primary color is almost black                                                              | Apply consistent accent, surface, border and interaction tokens                                   |
| Spacing               | Existing spacing utilities are useful, but auth pages stack outer padding, card padding and large vertical centering | Standardize page, section and form spacing; reduce compounded padding on mobile                   |
| Typography            | Reasonable sizes already exist, but headings, metadata and body styles vary across screens                           | Define shared heading/body/metadata scales and consistent semantic headings                       |
| Authentication forms  | Already styled and labeled; not unstyled HTML. Rendered footer divider is conspicuously dark                         | Use explicit border tokens, quieter shadows, stronger branding and consistent field treatment     |
| Registration          | Social buttons absent despite existing backend support                                                               | Reuse the login provider controls                                                                 |
| Provider availability | Initial loading, request failure and genuinely disabled providers all appear as “unavailable”                        | Distinguish loading, unavailable and retryable failure                                            |
| Navigation            | Desktop account dropdown and mobile Sheet already exist                                                              | Retain behavior; improve active states, CTA emphasis and Home/Posts separation                    |
| Post cards            | Author, date, title and excerpt exist; presentation is fairly uniform and generic                                    | Improve title prominence, metadata wrapping, card spacing and footer alignment                    |
| Post detail           | Good 720px reading width, but no authorized post edit/delete actions or contextual navigation                        | Add back link, post action menu, refined title/metadata block and deliberate article spacing      |
| Comments              | Styled composer/cards exist, but no list-loading state; an empty message can appear before retrieval finishes        | Add comment skeletons, separate fetch/mutation errors and show the supported total                |
| Admin shell           | Sidebar and mobile admin Sheet exist; desktop shell is a plain subsection of the public layout                       | Give administration a stronger navy sidebar, clear active navigation and wider workspace          |
| Admin dashboard       | Real totals and management links exist                                                                               | Refine metric cards with restrained icon color and clear count definitions                        |
| Tables                | Existing shadcn-style tables and mobile cards; dates absent from admin lists                                         | Add available dates, consistent headers, deliberate column sizing and compact action menus        |
| Loading               | Most pages replace content with the same spinner                                                                     | Use shape-matched skeletons initially and retain existing content during refresh                  |
| Empty states          | Present, but mostly generic messages without useful next steps                                                       | Add contextual actions; never display an empty state because a request failed                     |
| Errors                | Present, but retries and presentation differ; some pages can show error and empty state together                     | Standardize mutually exclusive initial states and inline refresh errors                           |
| Success feedback      | No consistent create/update/delete feedback                                                                          | Add Sonner success messages while retaining inline actionable errors                              |
| Responsive behavior   | Mobile registration fits at 375px; menus and mobile card layouts exist                                               | Validate long titles/names/emails, comment metadata, narrow pagination and action groups          |
| Reuse                 | Desktop/mobile management markup repeats action logic; date formatting and form structure repeat                     | Extract small shared presentation and action components                                           |
| Accessibility         | Labels, skip link and accessible primitives exist; auth card titles are not actual page headings                     | Add semantic `h1`s, labels for edit textareas, visible focus and consistent error associations    |

Specific UX defects visible in source deserve attention:

- Post detail does not reset loading/error state correctly when the slug changes, and requests lack stale-response protection.
- Comment creation changes the page to one while also calling a loader closed over the old page. This can create competing requests. Because comments sort oldest first, the new comment may not appear on page one.
- Deleting the last item on a later page can leave the user on an empty page.
- Pagination has no pending/disabled contract.
- Admin user editing requires an email even for supported provider-only accounts without one.
- Protected-admin restrictions are incompletely reflected in the form; the server remains authoritative.
- Authentication guards treat an initialization error like an anonymous session, instead of offering a retry.

**Portfolio readiness:** the application has substantial functional depth, but its presentation still resembles a general-purpose starter UI. Reaching the target requires a coordinated pass across the shell, public pages, forms, content management and states. A color change alone would not close the gap.

**3. Assignment–implementation–design gap matrix**

“REQUIRED” below means required by your supplied baseline or necessary to preserve existing functionality. Original-assignment attribution remains provisional.

| Assignment/request requirement     | Current implementation                       | Reference expectation            | Backend support?         | Frontend support?   | Classification and action                               |
| ---------------------------------- | -------------------------------------------- | -------------------------------- | ------------------------ | ------------------- | ------------------------------------------------------- |
| Email/password registration/login  | Implemented                                  | Polished auth cards              | Yes                      | Yes                 | **REQUIRED:** preserve and restyle                      |
| Google/Facebook login              | Implemented; configuration-dependent         | Both providers on login/register | Yes                      | Login only          | **REQUIRED:** add registration entry points             |
| JWT/refresh/RBAC                   | Implemented                                  | Role-aware interface             | Yes                      | Yes                 | **REQUIRED:** preserve contracts and ownership          |
| Public post listing/pagination     | Implemented at `/`                           | Dedicated listing                | Yes                      | Yes                 | **REQUIRED:** retain; add `/posts` presentation route   |
| Post detail                        | Implemented                                  | Clear article and discussion     | Yes                      | Yes                 | **REQUIRED:** refine layout                             |
| Post create/edit                   | Shared editor                                | Rich-looking editor              | Title/content only       | Yes                 | **REQUIRED:** retain plain-text form                    |
| Automatic slug                     | Generated once by backend                    | Slug field shown                 | Yes                      | No input needed     | **REQUIRED:** retain automatic generation               |
| Own/admin post actions             | Available in management pages                | Actions near content             | Yes                      | Missing on detail   | **UI IMPROVEMENT:** expose existing actions             |
| Comment CRUD                       | Implemented                                  | Composer and comment items       | Yes                      | Yes                 | **REQUIRED:** preserve and fix states                   |
| My Posts                           | Author-filtered listing                      | Profile-style management         | Yes                      | Yes                 | **REQUIRED:** restyle with lightweight identity summary |
| Account linking                    | Implemented                                  | Settings/profile surface         | Yes                      | Yes                 | **REQUIRED:** preserve existing feature                 |
| Admin statistics                   | Three real totals                            | Metric cards                     | Yes                      | Yes                 | **REQUIRED:** refine labels and styling                 |
| Admin users                        | CRUD/deactivation/reactivation               | Management table/form            | Yes                      | Yes                 | **REQUIRED:** retain supported actions                  |
| Admin posts                        | Active/deleted/all filters                   | Management table/status          | Yes                      | Yes                 | **REQUIRED:** preserve actual statuses                  |
| Admin comments                     | List/edit/delete                             | Moderation navigation            | Yes                      | Yes                 | **REQUIRED:** retain page                               |
| Real-time notifications            | Persistent inbox and sockets                 | Bell                             | Yes                      | Yes                 | **REQUIRED:** preserve existing feature                 |
| Home hero/latest posts             | Basic intro/feed                             | Illustrated hero/featured cards  | Existing list sufficient | Partial             | **UI IMPROVEMENT:** add hero; label cards “Latest”      |
| Loading/error/empty/success states | Partial/inconsistent                         | Finished interactions            | No API changes needed    | Partial             | **UI IMPROVEMENT:** standardize                         |
| Joined/created dates               | Available in DTOs                            | Table date columns               | Yes                      | Partially displayed | **UI IMPROVEMENT:** display                             |
| Comment total on detail            | Available through comment metadata           | Discussion count                 | Yes                      | Not displayed       | **UI IMPROVEMENT:** use `meta.total`                    |
| Comment counts on cards            | Not in post DTO                              | Card counters                    | No                       | No                  | **OPTIONAL:** omit from this redesign                   |
| Search                             | No search query/API                          | Search boxes                     | No                       | No                  | **OPTIONAL:** defer; omit controls                      |
| Reading time                       | Derivable from full content                  | Detail metadata                  | No new API needed        | No                  | **OPTIONAL:** omit initially                            |
| Cover images/uploads               | No fields/storage flow                       | Images and uploader              | No                       | No                  | **OUT OF SCOPE:** remove                                |
| Categories/featured flags          | No model/query support                       | Filters, tags, featured section  | No                       | No                  | **OUT OF SCOPE:** remove                                |
| Likes/bookmarks/followers          | Not implemented                              | Social controls                  | No                       | No                  | **OUT OF SCOPE:** remove                                |
| Recent-author directory            | No suitable public directory API             | Listing sidebar                  | No                       | No                  | **OUT OF SCOPE:** remove                                |
| Rich text/drafts                   | Plain text; no draft state                   | Toolbar and draft badge          | No                       | No                  | **OUT OF SCOPE:** remove                                |
| Edit profile/bio/avatar upload     | No self-service update contract              | Full profile editor              | No                       | No                  | **OUT OF SCOPE:** omit                                  |
| Forgot password/remember me        | No recovery or configurable persistence flow | Auth links/checkbox              | No                       | No                  | **OUT OF SCOPE:** omit                                  |
| Rich analytics                     | Totals only                                  | Analytics-style dashboard        | No time-series support   | No                  | **OUT OF SCOPE:** no invented charts                    |

**4. Features to KEEP**

Preserve all existing working flows:

- Local authentication, OAuth callbacks and explicit provider linking.
- Current access-token/refresh-cookie architecture and backend enforcement.
- Post and comment CRUD, validation limits, ownership and admin overrides.
- Stable slugs, pagination and author filtering.
- User deactivation/reactivation and protected-administrator rules.
- Active/deleted post inspection and comment moderation.
- Notification persistence, recipient privacy, socket events and REST recovery.
- Safe plain-text rendering.
- Existing routing conventions, dialogs and responsive navigation.

The existing backend supports the proposed visual redesign without database changes.

**5. Features and improvements to ADD**

Add presentation and interaction improvements using current contracts:

- Separate home and post-listing screens.
- Social-provider buttons on registration.
- Authorized post actions on detail.
- Comment total from existing pagination metadata.
- Admin joined/created dates.
- Profile-style header for My Posts using name, initials and available email.
- Reusable form-field/error treatment.
- Content-shaped skeletons, stable refresh layouts and pending pagination.
- Contextual empty states and consistent success feedback.
- Reliable request sequencing and page-boundary handling.
- Clear distinction between unavailable providers and failed provider discovery.

Make narrowly scoped correctness fixes where inspection identified real issues; do not replace authentication or socket architecture.

**6. Reference features to REMOVE / NOT IMPLEMENT**

Do not reproduce:

- Cover-image fields, image upload controls or fake article thumbnails.
- Category badges, category sidebars or category counts.
- Featured-post administration; use **Latest posts**.
- Likes, bookmarks, followers, replies or social counters.
- Recent-author directory.
- Draft/published workflow. Use existing **Active/Deleted** status where applicable.
- Rich-text toolbar.
- Profile editing, bio fields, profile-photo uploads or unsupported profile tabs.
- Search boxes and sort menus without matching API behavior.
- Forgot-password and remember-me controls.
- Analytics charts, growth percentages or fabricated activity.
- An About navigation link without a planned page.

A decorative home illustration can use static CSS/SVG shapes. It must not imply post-image support.

**7. Pages/routes and API-to-page mapping**

All endpoints below are relative to `/api/v1`.

| Route                    | Access            | Planned presentation                    | Existing API                                                             |
| ------------------------ | ----------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| `/`                      | Public            | Hero, CTAs, three latest posts          | `GET /posts`                                                             |
| `/posts` **new**         | Public            | Paginated text-first feed               | `GET /posts?page&limit`                                                  |
| `/login`                 | Public            | Branded auth card                       | `POST /auth/login`, `GET /auth/providers`, provider initiation routes    |
| `/register`              | Public            | Registration plus social providers      | `POST /auth/register`; same provider routes                              |
| `/auth/callback`         | Public callback   | Completion/loading/failure              | Existing refresh flow                                                    |
| `/posts/:slug`           | Public            | Article, discussion, authorized actions | `GET /posts/slug/:slug`; comment list/create; post/comment mutations     |
| `/posts/new`             | Authenticated     | Shared title/content editor             | `POST /posts`                                                            |
| `/posts/:id/edit`        | Owner/admin       | Same editor                             | `GET/PATCH /posts/:id`                                                   |
| `/dashboard`             | Authenticated     | My Posts and identity summary           | `GET /posts?authorId=...`; delete post                                   |
| `/account`               | Authenticated     | Read-only identity and linked providers | Existing auth state; `GET /auth/providers`; `POST /auth/{provider}/link` |
| `/admin`                 | Admin             | Three totals and management links       | `GET /admin/stats`                                                       |
| `/admin/users`           | Admin             | User table/mobile list                  | `GET /users`; existing status mutations                                  |
| `/admin/users/new`       | Admin             | Create-user form                        | `POST /users`                                                            |
| `/admin/users/:id/edit`  | Admin             | Edit-user form                          | `GET/PATCH /users/:id`                                                   |
| `/admin/posts`           | Admin             | Active/deleted/all listing              | `GET /admin/posts`; existing post mutations                              |
| `/admin/comments`        | Admin             | Comment moderation                      | `GET /admin/comments`; `PATCH/DELETE /comments/:id`                      |
| `/403`, unmatched routes | Appropriate state | Recovery navigation                     | None                                                                     |

The header bell continues to use:

- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- Existing `notification:new`, `notifications:changed` and `auth:error` events.

Keep notification management in the existing popover. A separate inbox page is unnecessary.

Preserve slug-based reading URLs and ID-based editing URLs. No existing route needs removal.

**8. Component architecture**

Retain the current provider/router/API structure. Introduce small reusable components around repeated presentation.

| Layer      | Components and responsibilities                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------ |
| Layout     | `MainLayout`, refined `AdminLayout`, shared `AuthCard`                                           |
| Navigation | Existing Header, MobileNavigation, account dropdown, admin navigation                            |
| Posts      | Existing PostCard; extracted PostMeta, PostActions and PostForm                                  |
| Comments   | Extract CommentSection, CommentItem and CommentForm; share form treatment with EditCommentDialog |
| Management | Shared table container, row action components and status display; retain page-specific columns   |
| Feedback   | Existing confirmation/error/empty states; add contextual skeletons and Toaster                   |
| Forms      | Shared field wrapper for label, help text, error and accessibility IDs                           |
| Utilities  | Shared date formatting and frontend permission predicates                                        |

Desktop tables and mobile cards should reuse the same action components and permission decisions. Avoid a generic table framework or schema-driven form system.

Minimal interface additions:

- Pagination gains an optional pending/disabled state and compact presentation for the notification panel.
- EmptyState gains an optional action.
- Loading presentation supports post-grid, article, table, comment and metric skeletons.
- PostActions accepts the post, permitted actions and completion callback.
- API DTOs and request payloads remain unchanged.

**9. shadcn component mapping and visual rules**

| Component                | Use                                                    |
| ------------------------ | ------------------------------------------------------ |
| Button                   | Primary, secondary, destructive and pending actions    |
| Input / Textarea / Label | Existing auth, post, comment and admin fields          |
| Card                     | Posts, auth panels, metrics and mobile management rows |
| DropdownMenu             | Account and compact row/post actions                   |
| AlertDialog              | Post/comment deletion and user deactivation            |
| Dialog                   | Comment editing                                        |
| Avatar                   | Initials only, using existing names                    |
| Badge                    | Actual role, active/deleted and connection states      |
| Table                    | Desktop management views                               |
| Sheet                    | Existing public/admin mobile navigation                |
| Skeleton                 | Initial loading matched to content structure           |
| Alert                    | Inline errors and relevant persistent notices          |
| Popover                  | Existing notification inbox                            |
| Sonner                   | Successful create/update/delete feedback               |
| Pagination               | Retain and improve the current wrapper                 |
| Tabs                     | Not needed merely to reproduce the profile mockup      |

Sonner is the appropriate addition for toast feedback; current shadcn documentation favors it over the older toast component. [Official documentation](https://ui.shadcn.com/docs/components/radix/sonner)

Visual defaults:

- Preserve **Inkstone** branding; treat BlogSphere as the design reference.
- Background `#F8FAFC`, white surfaces, slate text, blue primary around `#2563EB`, subtle indigo accents.
- Navy admin sidebar with a clearly differentiated active item.
- Approximately 12px card radius, subtle borders, minimal shadows.
- Consistent 4/8/12/16/24/32/48 spacing scale.
- System sans-serif throughout; article text around 18px with generous line height and a maximum width near 720px.
- Public container around 1152px; admin workspace up to approximately 1280px.
- One-column mobile layouts; two-column tablet and three-column desktop home cards.
- Visible keyboard focus, comfortably sized touch controls, and reduced-motion support.
- Explicit border colors, including table dividers and auth-card footers.

Do not reinitialize shadcn or overwrite existing primitives wholesale. The project already has the necessary Tailwind/Vite integration.

**10. Files likely to change**

Paths below are relative to the repository root.

| Files/group                                                                          | Planned work                                               |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `frontend/src/styles/global.css`                                                     | Theme, typography, border and focus rules                  |
| `frontend/src/layouts/{MainLayout,AdminLayout}.tsx`                                  | Public/admin visual structure                              |
| `frontend/src/components/{Header,MobileNavigation}.tsx`                              | Home/Posts navigation and consistent branding              |
| `frontend/src/routes/AppRouter.tsx`                                                  | Add `/posts`; home route uses new landing page             |
| `frontend/src/pages/{BlogPages,AuthPages,UserPages,AdminPages,StatusPages}.tsx`      | Screen redesign and identified UX corrections              |
| `frontend/src/components/{PostCard,Pagination,States,StatCard,NotificationBell}.tsx` | Reusable presentation and state refinements                |
| Existing edit/confirmation dialogs                                                   | Consistent errors, labels and pending behavior             |
| New `HomePage`, post/comment/form components                                         | Focused presentation extraction                            |
| `frontend/src/components/ui/sonner.tsx`, `frontend/src/App.tsx`                      | Shared success feedback                                    |
| `frontend/src/tests/*`                                                               | Page interactions, loading/error flows and regressions     |
| `frontend/package.json`, root lockfile                                               | Sonner dependency only, unless a demonstrated need emerges |
| `README.md`, `Design-specs.md`                                                       | Accurate current architecture and redesign documentation   |

Conditional corrective changes:

- `frontend/src/api/client.ts` and authentication tests: stale refresh/token handling.
- `frontend/src/context/NotificationContext.tsx`: fetch/event/account-change races.
- `frontend/src/routes/Guards.tsx`: retryable initialization failures.
- Backend test setup/configuration: deterministic test environment and timeout diagnosis.

No planned changes to MongoDB models, backend business APIs, OAuth contracts or socket event names.

**11. Step-by-step implementation sequence**

1. **Establish a reliable baseline.** Isolate backend test provider configuration, diagnose the timeout, and record passing checks. Confirm the original brief when available.
2. **Add targeted regression coverage.** Cover stale refresh completion, notification races, slug changes, comment pagination and last-row deletion before altering those paths.
3. **Define shared visual foundations.** Update tokens, borders, typography, controls, headings and feedback components.
4. **Refine application shells.** Public header, mobile Sheet, admin sidebar/workspace and authentication layout.
5. **Build home and listing.** Add `/posts`; home reuses the existing list response for three latest posts. No new endpoint or search.
6. **Refine authentication/account.** Shared auth layout, registration providers, provider-fetch states, accurate account copy and linking feedback.
7. **Refine article/discussion.** Authorized actions, comment total, proper loading/error behavior, shared comment forms and responsive metadata.
8. **Refine editor/My Posts.** Title/content only, stable edit initialization, identity summary, confirmations and success feedback.
9. **Refine administration.** Metric cards, dates, row actions, actual statuses, mobile layouts and admin-user form corrections.
10. **Complete interaction consistency.** Preserve content during refresh, disable pending pagination, recover from invalid pages and distinguish mutation success from refresh failure.
11. **Run acceptance checks.** Automated tests, typechecks/builds, role-based manual flows and responsive visual review.
12. **Update documentation and demo flow.** Explain preserved functionality and intentional exclusions.

State behavior should be explicit:

- Initial fetch: matching skeleton, then content, error or empty state.
- Background refresh: retain content, indicate activity and prevent conflicting actions.
- Failed refresh: retain valid existing data and offer retry.
- Mutation failure: preserve entered text and show an actionable inline error.
- Mutation success: give feedback, then refresh; a refresh failure must not imply the mutation failed.
- After deleting a page’s last item: move to the previous valid page.
- After adding a comment: refresh authoritative pagination and show the page containing the new comment, respecting oldest-first ordering.
- Route/account changes: discard responses from the previous context.

**12. Risks, regression areas and acceptance tests**

| Risk                                | Required verification                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Refresh after logout/account switch | Real refresh completion must not restore an old token or replay requests as the previous user                  |
| Temporary refresh failure           | Network/server errors must be distinguished from definitive invalid sessions                                   |
| Notification races                  | Delayed REST responses must not overwrite newer events/read state; duplicate events must not inflate the badge |
| Route changes                       | Rapid navigation between slugs must not show an earlier article or sticky error                                |
| Pagination                          | Pending controls, last-item deletion and filter/page changes behave consistently                               |
| RBAC                                | Visitors, owners, other users and admins see appropriate actions; server enforcement remains intact            |
| Provider-only users                 | Admin can edit supported fields without inventing an email                                                     |
| Protected administrators            | UI reflects restrictions; backend remains authoritative                                                        |
| Deletion semantics                  | Correctly distinguish hidden posts, permanently deleted comments and deactivated accounts                      |
| Text safety                         | HTML-like content remains inert; long words, URLs and line breaks render safely                                |
| Responsive layout                   | No page-wide overflow at 320, 375, 768, 1024 and 1440px                                                        |
| Accessibility                       | Keyboard navigation, modal focus return, form labels/errors, headings and focus visibility                     |
| OAuth                               | Available/unavailable/error states; callback and explicit linking behavior preserved                           |
| Visual consistency                  | Verify populated, loading, empty, error and pending screens—not only ideal screenshots                         |

Two source-level concerns need particularly careful tests:

- `api/client.ts` sets the refreshed token before the AuthContext generation check can reject stale completion. The existing test mocks `refreshAccess`, so it does not exercise this token write.
- Notification fetching schedules a second fetch when events arrive, but still applies the first response. Duplicate notification events also increment the count before REST reconciliation.

These justify small corrective patches, not architectural replacement.

Final verification commands:

```powershell
npm.cmd run typecheck --workspaces
npm.cmd test --workspaces
npm.cmd run build --workspaces
```

Include a two-user notification demonstration and owner/admin moderation checks against a test environment. No database migration is expected.

**13. Final recommended interview-assignment scope**

Deliver a polished **Inkstone** frontend with:

- A distinctive home page and paginated post feed.
- Consistent authentication screens with existing social login.
- Strong article typography and reliable comments.
- A shared plain-text post editor.
- Lightweight My Posts and Account screens.
- Professional administration for users, posts and comments.
- Existing persistent real-time notifications.
- Complete responsive, accessible loading/error/empty/pending/success treatment.

The target should be **the reference’s visual quality, adapted to verified functionality**. The highest-value work is making the existing depth understandable, attractive and reliable during an interview demonstration.

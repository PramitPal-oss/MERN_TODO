**Recommended direction:** keep Inkstone’s identity and existing application flows, and migrate the presentation layer incrementally to Tailwind CSS and shadcn/ui. Use a restrained neutral theme, compact layouts and consistent interaction states.

No code was changed during this review. The repository currently contains package/lockfile changes and `RealTime_Notification_specs.md`; preserve them. Socket.io dependencies are present, but notification implementation files are not.

**1. Current frontend architecture**

| Area                 | Current implementation                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Runtime              | React 19, TypeScript, Vite 7                                                                    |
| Routing              | React Router 7; nested public, protected and admin routes                                       |
| Authentication       | AuthContext with initialization, authenticated, anonymous and error states                      |
| API                  | Axios clients; memory-only access token; refresh handling                                       |
| Forms                | React Hook Form/Zod for authentication and post editor; local state/native validation elsewhere |
| Pages                | Grouped in `AuthPages`, `BlogPages`, `UserPages`, `AdminPages`, `StatusPages`                   |
| Layouts              | Shared MainLayout; nested AdminLayout                                                           |
| Shared components    | Header, Pagination, SafeText and loading/error/empty states                                     |
| UI libraries         | No existing component framework or icon library                                                 |
| Notifications/toasts | No implemented notification UI or toast system                                                  |
| Tests                | Vitest, React Testing Library and jsdom                                                         |

Preserve route definitions, exports, API methods, payloads, validation schemas, authentication and ownership checks. Presentational extraction is permitted; a new state-management or data-fetching framework is unnecessary.

**2. Current styling architecture**

All styling lives in `frontend/src/styles/global.css`:

- Warm paper/green palette.
- Google-hosted DM Sans and Libre Franklin.
- Global element selectors for forms, inputs, labels, headings and tables.
- Shared semantic classes such as `.button`, `.alert`, `.post-card`.
- One principal responsive breakpoint at 760px.
- Large headings and generous hero spacing.
- Horizontally scrolling tables on small screens.

The global element selectors are the main migration hazard: they can override or unintentionally affect shadcn components, including portaled dialogs.

Retain `global.css` as the final stylesheet entry point, but progressively replace legacy component rules with Tailwind classes.

**3. Existing UX issues to address**

These are findings from source inspection, not a completed browser visual audit:

- The feed hero and article headings consume substantial vertical space.
- Mobile navigation wraps desktop links instead of providing a dedicated menu.
- Account and logout controls occupy primary navigation space.
- Browser `confirm()` handles destructive actions; admin comment editing uses `prompt()`.
- Some admin lists initially resemble empty results because they lack explicit loading states.
- Comment actions and admin user submission lack consistent pending/disabled states.
- Logout failures are silently swallowed.
- Form errors are not consistently connected to inputs through accessibility attributes.
- Tables and row actions need a deliberate mobile layout.
- Shared cards, forms and action groups have inconsistent density.
- Comment counts and profile image URLs are not available in the current post/user DTOs.

Do not fabricate comment counts, avatars, search controls, charts or activity feeds.

**4. Tailwind/shadcn installation requirements**

Use **Tailwind CSS 4**, its Vite plugin and shadcn’s existing-project installation path. Keep React, Vite and the routing architecture in place. The official setup supports adding Tailwind and an `@/*` alias to an existing Vite application. [shadcn Vite installation](https://ui.shadcn.com/docs/installation/vite)

Implementation configuration:

- Add `tailwindcss` and `@tailwindcss/vite` to the frontend workspace.
- Add frontend `@types/node` for configuration imports.
- Configure `@` → `frontend/src` in Vite, Vitest, `tsconfig.json` and `tsconfig.app.json`.
- Create `frontend/components.json`.
- Choose the **Radix-based** shadcn components, neutral base color, CSS variables, TypeScript and Lucide icons.
- Store generated component source under `src/components/ui`.
- Add `src/lib/utils.ts` with `cn`, using `clsx` and `tailwind-merge`.
- Install only dependencies required by selected components.
- Keep the root workspace lockfile; do not create a second frontend lockfile.
- Do not scaffold a replacement project or accept a CLI overwrite of application files.

Use CSS-first Tailwind configuration; do not introduce a Tailwind 3/PostCSS setup unnecessarily.

**5. Proposed design system**

| Token                  | Decision                                                |
| ---------------------- | ------------------------------------------------------- |
| Theme                  | Light-only for this migration                           |
| Page background        | `#FAFAFA`                                               |
| Card/header background | `#FFFFFF`                                               |
| Primary text           | `#18181B`                                               |
| Secondary text         | `#52525B`                                               |
| Border                 | `#E4E4E7`                                               |
| Primary action         | `#18181B`, white text                                   |
| Focus ring             | `#2563EB`, with visible offset                          |
| Destructive            | `#B91C1C`, with matching light surface                  |
| Success                | Dark green text on pale green                           |
| Font                   | System sans-serif throughout                            |
| Article body           | Georgia/serif, 18px, approximately 1.8 line height      |
| Page title             | 28px mobile, 32px desktop                               |
| Article title          | 32px mobile, maximum 44px desktop                       |
| Body/UI text           | 16px body; 14px secondary/table text                    |
| Radius                 | 8px controls, 12px cards                                |
| Shadows                | Subtle on cards; stronger only for overlays             |
| Spacing                | 4px scale; 16–24px card padding; 24–32px section gaps   |
| Motion                 | 150ms color/opacity transitions; respect reduced motion |

Map these values to shadcn semantic variables such as `background`, `foreground`, `card`, `muted`, `primary`, `destructive`, `border` and `ring`.

Remove external font imports only after migration is complete. No gradients, decorative imagery, animated backgrounds or theme switcher.

**6. Layout strategy**

Desktop header:

```text
Inkstone     Stories   My posts   Write          Account avatar
```

Add the notification bell between navigation and account controls only when the notification feature exists.

- Header height approximately 64px.
- Shared content maximum width: 1152px.
- Horizontal padding: 16px mobile, 24px tablet, 32px desktop.
- Standard content spacing below header: 24px mobile, 32px desktop.
- Article width: approximately 720px.
- Authentication card: maximum 448px.
- Editor: maximum 896px.
- Account/forms: maximum 640px.

The account DropdownMenu contains name/email, Account, Admin when authorized, and Log out. Preserve the existing logout call and redirect; display an error if it fails.

Below 768px, use a Sheet for navigation. Close it after navigation and restore focus to its trigger.

Keep the current MainLayout/AdminLayout nesting. Do not add a second router or change route paths.

**7. Page-by-page redesign**

| Screen           | Concrete redesign                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Public feed `/`  | Compact title and one-line introduction; two-column cards from 768px, one column below; no oversized hero                          |
| Post card        | Title link, three-line excerpt, author initials/name, date and “Read story” link; 20px padding; no nested interactive card wrapper |
| Post detail      | Title, author/date, separator, readable plain-text body, then comments; preserve SafeText and whitespace                           |
| Login/register   | Centered Card, clear title, labeled fields, inline errors, full-width primary action, separator and provider buttons               |
| OAuth buttons    | Consistent outline buttons with provider names; retain disabled availability behavior and original redirects                       |
| OAuth callback   | Compact spinner/status message; preserve refresh and redirect logic                                                                |
| My posts         | Compact page heading and Write button; desktop table, mobile cards; existing edit/delete actions                                   |
| Create/edit post | One form card with title and large textarea; existing RHF/Zod validation; label primary action “Publish post” or “Save changes”    |
| Comments         | Composer and compact comment rows; author/date, text, ownership-based actions; keep inline editing                                 |
| Account          | Read-only identity summary and connected-provider rows; preserve provider linking and query-string feedback                        |
| 403/404          | Compact centered state, plain explanation and existing home link                                                                   |

No markdown editor, rich text, autosave, cover images, drafts or new business features.

**8. Shared component design**

Add shadcn primitives as their consumers migrate:

| Primitive              | Use                                       |
| ---------------------- | ----------------------------------------- |
| Button                 | Actions and link styling                  |
| Card                   | Feed, forms, empty states and dashboard   |
| Input, Textarea, Label | Existing forms                            |
| Badge                  | Role, account status, deleted status      |
| Avatar                 | Initials fallback; no invented image URLs |
| DropdownMenu           | Account and row actions                   |
| Sheet                  | Mobile navigation                         |
| AlertDialog            | Destructive confirmations                 |
| Dialog                 | Admin comment editing                     |
| Table                  | Desktop management lists                  |
| Skeleton               | Initial page/card/table loading           |
| Alert                  | Persistent errors and important feedback  |
| Separator              | Forms, account rows, reading layout       |
| Native Select          | Existing role and post-status selects     |
| Checkbox               | Existing active-account field             |

Use existing `Pagination` with shadcn Buttons, keeping its current props and page callbacks. A separate pagination package is unnecessary.

Keep existing RHF `register`, resolvers and submission handlers. Use Label/Input/Textarea plus explicit error associations instead of rewriting all forms around a new wrapper. shadcn supports composition with React Hook Form and Zod. [Form integration](https://ui.shadcn.com/docs/forms/react-hook-form)

Do not add Tabs, Tooltip, ScrollArea or Sonner initially. Their current use cases are covered by navigation, accessible labels, native overflow and inline feedback.

Add these application components:

- `PageHeading`: title, description and optional action.
- `UserAvatar`: initials/name presentation.
- `ConfirmActionDialog`: controlled confirmation with pending/error state.
- `PostCard`: presentation-only post summary.
- `StatCard`: label, value, description and icon.
- `EditCommentDialog`: controlled textarea using the existing update API.

**9. Admin redesign**

Use a 224px sidebar from 1024px upward, with Overview, Users, Posts and Comments. Below that width, replace the sidebar with an “Admin navigation” Sheet.

Dashboard:

- Three equal stat cards on desktop; stack on mobile.
- Preserve the existing metric definitions:
  - Users includes inactive accounts.
  - Posts counts active posts.
  - Comments counts comments on active posts.
- Below the cards, provide navigation cards to management screens.
- Do not add embedded tables requiring extra dashboard fetches or invent trend metrics.

Management screens:

- Users: name/email, role badge, status badge, actions.
- Posts: title, author, status, existing Active/Deleted/All selector.
- Comments: excerpt, post, author, edit/delete actions.
- Maintain server pagination and existing filters.
- Use mobile record cards below 768px; tables above it.
- Share action handlers between representations.
- Keep inactive/protected-account restrictions and backend errors intact.

Replace dialogs with accurate copy:

- **Post:** “Delete post? It will be hidden from readers. There is no restore action in this interface.”
- **Comment:** “Delete comment? This permanently removes the comment.”
- **User:** “Deactivate user? They will lose access to the application.”

Do not describe soft deletion as permanent database deletion.

Controlled dialogs remain open on API failure, show the error, and disable duplicate confirmation while pending. Close only after success.

**10. Notification redesign**

Current state: dependencies and a written specification exist, but no notification context, bell or socket lifecycle is implemented.

For this UI migration:

- Do not create a fake bell, unread count or notification store.
- Do not implement Socket.io as part of the styling task.
- When the separate feature lands, restyle its existing components and callbacks.

The agreed visual target:

- Bell button with accessible unread count; display `99+` above 99.
- shadcn Popover, maximum 384px and constrained to viewport width.
- Header with “Notifications” and existing mark-all action.
- Rows with message, relative timestamp and explicit unread indicator.
- Unread background plus dot; do not rely on color alone.
- Existing read/open callbacks and pagination.
- Loading, empty, error and disconnected states.
- Use a generic comment icon if the notification DTO lacks an actor name; do not parse names from message text.
- Native vertical overflow, maximum approximately 60vh.

Add Popover only when this integration is actually implemented. Preserve the notification provider’s ownership of connections and state.

**11. Responsive strategy**

| Width      | Expected behavior                                                                   |
| ---------- | ----------------------------------------------------------------------------------- |
| 320–639px  | One-column content, navigation Sheet, stacked actions, mobile management cards      |
| 640–767px  | More spacing; retain mobile navigation and management cards                         |
| 768–1023px | Desktop main navigation, two-column feed, management tables; admin navigation Sheet |
| 1024px+    | Persistent admin sidebar; full desktop composition                                  |

Additional requirements:

- No document-level horizontal scrolling.
- Long titles, URLs and email addresses wrap.
- Form action groups stack where necessary.
- Touch controls use at least 44px targets.
- Dialogs fit the viewport and scroll internally.
- Test 320, 375, 768, 1024 and 1440px, plus 200% zoom.

**12. Accessibility improvements**

- Add a skip link to the main content.
- Keep semantic `header`, `nav`, `main`, `article`, headings and tables.
- Use one page-level `h1`.
- Associate every field with a label.
- Connect errors using `aria-invalid` and `aria-describedby`.
- Preserve autocomplete and input types.
- Label all icon-only controls; hide decorative icons from assistive technology.
- Use real buttons for actions and Router links for navigation.
- Use Radix focus management for Sheets, menus and dialogs.
- Include dialog titles/descriptions and restore focus after closing.
- Mark pending sections with `aria-busy`; skeleton decoration is hidden from screen readers.
- Preserve errors as visible inline Alerts.
- Verify contrast, keyboard-only navigation and reduced-motion behavior.

**13. Files to create**

```text
frontend/components.json
frontend/src/lib/utils.ts
frontend/src/styles/legacy.css              # temporary migration bridge
frontend/src/components/ui/*               # only selected generated primitives
frontend/src/components/PageHeading.tsx
frontend/src/components/UserAvatar.tsx
frontend/src/components/ConfirmActionDialog.tsx
frontend/src/components/PostCard.tsx
frontend/src/components/StatCard.tsx
frontend/src/components/EditCommentDialog.tsx
frontend/src/components/MobileNavigation.tsx
frontend/src/tests/navigation.test.tsx
frontend/src/tests/dialogs.test.tsx
frontend/src/tests/forms.test.tsx
```

Do not create a generic table engine, design-system package or new feature-state layer.

**14. Files to modify**

| Files                                                  | Purpose                                               |
| ------------------------------------------------------ | ----------------------------------------------------- |
| `frontend/package.json`, root `package-lock.json`      | Dependencies                                          |
| `frontend/vite.config.ts`, `frontend/vitest.config.ts` | Tailwind integration and matching aliases             |
| `frontend/tsconfig.json`, `frontend/tsconfig.app.json` | TypeScript alias                                      |
| `frontend/src/styles/global.css`                       | Theme, Tailwind imports and final base styles         |
| `frontend/src/components/Header.tsx`                   | Navigation, account menu and mobile trigger           |
| `frontend/src/components/States.tsx`                   | Shared accessible state presentation                  |
| `frontend/src/components/Pagination.tsx`               | New button styling; same contract                     |
| `frontend/src/layouts/MainLayout.tsx`                  | Content shell and skip-link target                    |
| `frontend/src/layouts/AdminLayout.tsx`                 | Responsive admin navigation                           |
| All five existing page-group files                     | Presentation and small pending/dialog state additions |
| Existing component tests/test setup                    | Updated assertions and required DOM mocks             |
| `README.md`                                            | Frontend stack and verification instructions          |

Leave backend files, API modules, AuthContext, route guards, route definitions and data models unchanged. Review and preserve any intervening notification changes rather than overwriting them.

**15. Old styles eventually removable**

Use a migration bridge before deleting CSS:

1. Move legacy visual rules into `legacy.css`.
2. Replace broad element rules with explicit legacy classes on existing elements, preserving their declarations.
3. Keep legacy CSS in a named layer before Tailwind utilities.
4. Remove legacy classes as each component migrates.
5. Remove a CSS rule only after searching for remaining consumers.

Initially omit Tailwind Preflight to reduce changes to unmigrated screens. Tailwind documents selective imports for this situation. Enable Preflight in the final cleanup stage and verify every migrated screen. During coexistence, give new primitives explicit border/reset styling where they otherwise depend on Preflight. [Tailwind Preflight guidance](https://tailwindcss.com/docs/preflight)

Eventually remove:

- Legacy `.button`, `.chip`, `.alert`, layout/card/table/form rules.
- Old mobile breakpoint rules after their consumers migrate.
- Legacy font import and palette variables.
- `legacy.css` itself.

Retain `global.css` for theme variables, Tailwind imports and a small base layer. Retain SafeText and its safe rendering behavior.

**16. Migration sequence**

1. Record route screenshots and current test/build results; preserve the existing working-tree changes.
2. Install/configure Tailwind and shadcn without overwriting application files.
3. Establish tokens, aliases and the legacy CSS bridge.
4. Add foundational primitives and migrate shared states/pagination.
5. Migrate MainLayout/Header and mobile navigation.
6. Migrate login, register, OAuth status and 403/404.
7. Migrate feed cards and post detail.
8. Migrate post editor, My posts and Account.
9. Migrate comments and destructive dialogs.
10. Migrate AdminLayout, dashboard, tables and user forms.
11. Integrate notification presentation only if the functional feature is present.
12. Complete keyboard, responsive and loading/error reviews.
13. Enable Preflight, remove unused legacy CSS and remove external fonts.
14. Run final verification and update documentation.

Each stage must remain runnable. Avoid mixing unrelated auth/API changes into migration commits.

**17. Regression risks and verification**

| Risk                           | Safeguard                                                   |
| ------------------------------ | ----------------------------------------------------------- |
| CSS cascade or reset changes   | Legacy isolation and visual checks per stage                |
| Broken RHF registration        | Preserve refs, names, handlers and existing schemas         |
| Accidental form submission     | Explicit `type="button"` for secondary/dialog/menu controls |
| Lost route behavior            | Keep paths, guards, redirects and navigation callbacks      |
| Incorrect permissions          | Preserve existing ownership/role conditions                 |
| Duplicate mutations            | Pending state and disabled actions                          |
| Dialog closes on failure       | Controlled open state; close only after success             |
| Mobile/desktop double requests | Render both presentations from the same fetched state       |
| Misleading empty state         | Explicit initial loading state for admin lists/comments     |
| Inaccessible overlays          | Keyboard/focus tests for real Radix interactions            |
| Missing production styling     | Check the production build, not only dev mode               |
| Notification regression        | Presentation consumes existing state; creates no sockets    |

Run:

```powershell
npm.cmd run typecheck --workspaces
npm.cmd run test --workspaces
npm.cmd run build --workspaces
```

Add focused tests for navigation visibility, mobile menu behavior, confirmation cancellation/success/failure, pending form states, label/error associations and unchanged pagination callbacks.

Manually demonstrate public browsing, registration/login, OAuth availability, post CRUD, comment CRUD, account linking and each admin management flow.

**18. Final acceptance checklist**

- [ ] Existing routes, APIs, payloads and authentication behavior are unchanged.
- [ ] Existing validation and permission checks remain intact.
- [ ] Every screen uses the agreed visual tokens and spacing.
- [ ] Mobile navigation and admin navigation work by keyboard and touch.
- [ ] Feed and article layouts are compact and readable.
- [ ] Every form has labels, errors and pending submit feedback.
- [ ] Browser confirm/prompt dialogs have accessible replacements.
- [ ] Soft-delete, permanent-delete and deactivate wording is accurate.
- [ ] Loading, empty and error states are distinguishable.
- [ ] No fabricated metrics, comment counts or notification functionality appear.
- [ ] No horizontal page overflow at the specified widths.
- [ ] Legacy CSS is removed only after all consumers migrate.
- [ ] Tests, typechecks and production builds pass.
- [ ] Final browser review covers all routes and the complete assignment demo flow.

# Tatparya Design System

This document is the shared source of truth for Tatparya's user interface. It is written for designers, developers, product collaborators, and AI coding assistants so that new work can extend the product without changing its visual character or interaction model.

Tatparya should feel calm, capable, clear, and trustworthy. The interface is inspired by Apple's emphasis on clarity, restraint, hierarchy, and direct manipulation, but it is not an imitation of Apple products. Do not copy Apple assets, proprietary components, or marketing layouts.

---

## 1. Product and experience goals

Tatparya turns business data into understandable findings, supporting visuals, and practical recommendations. The interface must help users move through a simple mental model:

**Upload → Ask → Decide**

Every screen should support at least one of these outcomes:

- Make the next action obvious.
- Reduce the effort required to understand data.
- Explain system state without exposing unnecessary technical detail.
- Preserve user trust through clear evidence, feedback, and error recovery.
- Work comfortably from a 320 px phone through large desktop displays.

When visual polish conflicts with clarity, accessibility, or task completion, task completion wins.

---

## 2. Core design principles

### Clarity

- Use one clear visual priority per screen or section.
- Prefer plain language and recognizable controls.
- Keep labels visible when an icon could be ambiguous.
- Use sentence case. Reserve uppercase text for short eyebrows and metadata labels.
- Remove decorative elements that do not explain hierarchy, state, or process.

### Deference

- Let the user's data, findings, and charts remain the focus.
- Use neutral surfaces and restrained shadows.
- Avoid excessive gradients, glass effects, borders, and saturated color.
- Do not make every card or action visually prominent.

### Meaningful depth

- Use layering to explain containment: page, surface, floating control, modal.
- A shadow should indicate elevation or separation, not decoration.
- Dark and light landing-page sections create rhythm and hierarchy; they are not arbitrary themes.

### Direct manipulation

- Controls should appear close to the content they affect.
- Provide immediate feedback after upload, save, submit, reorder, toggle, or delete.
- Preserve user input after a failed request. For example, clear a submitted query immediately, then restore it if the request fails.

### Consistency

- Reuse existing patterns, tokens, components, labels, and icon styles.
- Similar actions should appear in the same location and use the same visual treatment.
- New landing-page content must also be configurable from the admin dashboard.

### Progressive disclosure

- Show the primary action first and reveal secondary controls when needed.
- On smaller screens, place Rename and Delete in an overflow menu while keeping the most useful actions visible.
- Avoid presenting configuration, diagnostics, or advanced controls in the main user flow.

### Calm feedback

- Explain what happened and what the user can do next.
- Use color, iconography, and text together; never use color as the only status signal.
- Avoid flashing, blinking, and repeated notifications.

### Purposeful motion

- Animate transitions, progress, recording, and process relationships.
- Motion must never be required to understand content.
- Do not add decorative animation merely to make a page feel active.

---

## 3. Brand identity

### Product name

Always write the product name as **Tatparya**. Do not use the former InsightForge name in user-facing copy, screenshots, metadata, emails, PDFs, or generated reports.

### Logo assets

Use the shared `BrandLogo` component rather than placing logo files directly:

`client/src/components/common/BrandLogo.jsx`

Available variants:

| Variant | Asset | Intended use |
| --- | --- | --- |
| `symbol` | `client/public/brand/logo1.png` | Compact mobile headers, icons, and constrained spaces |
| `horizontal` | `client/public/brand/logo2.png` | Navigation bars, sidebars, emails, and standard brand display |
| `stacked` | `client/public/brand/logo3.png` | Spacious marketing or presentation layouts |

The favicon is stored at `client/public/favicon.svg`.

Logo rules:

- Preserve aspect ratio; use `object-contain`.
- Do not stretch, crop, recolor, redraw, or add effects to the logo.
- Give the logo clear space approximately equal to one quarter of its displayed height.
- Use the symbol on narrow mobile layouts and the horizontal logo when the product name can be comfortably displayed.
- Use meaningful alternative text when the logo communicates the brand. Use empty alt text only when adjacent text already says “Tatparya.”

---

## 4. Typography

### Font families

| Role | Font | Usage |
| --- | --- | --- |
| Primary | Plus Jakarta Sans | Interface, marketing copy, forms, headings, reports |
| Monospace | JetBrains Mono | Step numbers, compact data identifiers, code-like tokens only |

Fonts are loaded in `client/index.html`. The primary CSS definitions are in `client/src/styles.css`:

```css
--font-sans: 'Plus Jakarta Sans', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

Do not introduce another font without a product-wide design decision.

### Type hierarchy

| Style | Typical size | Weight | Line height | Notes |
| --- | --- | --- | --- | --- |
| Hero display | 48–72 px desktop, 38–48 px mobile | 700 | 0.98–1.05 | Tight tracking, short message only |
| Landing section heading | 36–48 px | 800 | 1.08 | Tracking around `-0.045em` |
| Dashboard page title | 24–30 px | 600 | 1.15 | Tracking around `-0.035em` |
| Card heading | 16–20 px | 600 | 1.3 | Keep concise |
| Body large | 16–18 px | 400 | 1.6 | Marketing introductions |
| Body | 14–16 px | 400 | 1.5–1.75 | Default UI and content |
| Label / metadata | 11–13 px | 500–600 | 1.4 | Use uppercase only for short eyebrows |

Typography rules:

- Keep comfortable line lengths: approximately 45–75 characters for reading copy.
- Avoid long all-caps strings.
- Use font weight and spacing before adding color or dividers.
- Do not reduce essential body text below 14 px. Legal metadata and compact helper copy may use 12 px if contrast remains sufficient.
- Allow text to wrap naturally. Never use fixed heights that clip translated or user-generated content.

---

## 5. Color system

The current project uses a small brand palette plus Apple-inspired neutral surfaces. Some values are still used as literals in components; new work should map to these documented roles and progressively centralize them rather than introducing one-off colors.

### Brand palette

| Token | Value | Usage |
| --- | --- | --- |
| Brand 50 | `#EEF2FF` | Selected backgrounds, subtle information surfaces |
| Brand 100 | `#E0E7FF` | Soft borders and active backgrounds |
| Brand 500 | `#4F46E5` | Focus, primary app actions, active states |
| Brand 600 | `#4338CA` | Primary action hover/pressed emphasis |
| Brand 700 | `#3730A3` | Strong brand emphasis |

### Neutral palette

| Role | Value | Usage |
| --- | --- | --- |
| Primary text | `#1D1D1F` | Headings and high-emphasis content |
| Strong secondary | `#3A3A3C` | Controls and strong body copy |
| Secondary text | `#515154` | Standard supporting text |
| Muted text | `#6E6E73` | Descriptions and secondary metadata |
| Subtle text | `#86868B` | Timestamps and tertiary metadata |
| Placeholder | `#98989D` | Input placeholders only |
| Disabled | `#C7C7CC` | Disabled controls and low-emphasis dividers |
| Border | `#D2D2D7` | Inputs and stronger boundaries |
| Soft border | `#E1E1E5` / `#ECECEF` | Cards and section separation |
| App background | `#F5F5F7` | Dashboard and admin canvas |
| Soft surface | `#F7F7F8` / `#FAFAFB` | Hover, inset, and grouped content |
| Surface | `#FFFFFF` | Cards, modals, navigation, input surfaces |

### Dark landing palette

| Role | Value | Usage |
| --- | --- | --- |
| Section background | `#0E1726` | Standard dark landing sections |
| Deep background | `#070D18` | Rare high-contrast platform areas |
| Elevated surface | `#121E31` | Cards within dark sections |
| Heading | `#FFFFFF` | Main dark-section headings |
| Body | Slate 300 | Primary explanatory copy |
| Muted | Slate 400 | Supporting content and metadata |
| Border | Slate 700 at about 80% | Dividers and card outlines |

### Semantic colors

| State | Foreground | Background | Guidance |
| --- | --- | --- | --- |
| Success | Emerald 700 | Emerald 50 | Completed, verified, ready |
| Warning | Amber 700–900 | Amber 50 | Low credits, attention needed |
| Error | Red 600–700 | Red 50–100 | Failure, invalid input, destructive action |
| Information | Brand 500–600 | Brand 50 | Active, selected, informational state |

Color rules:

- Meet WCAG AA contrast for normal text and controls.
- Never place muted text on a background where it becomes unreadable.
- Do not use brand purple for every clickable item; hierarchy should remain obvious.
- Destructive actions must be red and visually separated from normal actions.
- Focus indicators use Brand 500 and must remain visible on both light and dark surfaces.

---

## 6. Landing-page themes and section flow

Every configurable landing-page body section supports a `light` or `dark` theme. Navigation and footer are managed separately from reorderable body sections.

### Light theme

- Background: white.
- Heading: Slate 950 / primary text.
- Body: Slate 600.
- Accent: Slate 500 or brand color where interaction requires it.
- Border: Slate 200.
- Soft inset surface: `#F7F9FC`.

### Dark theme

- Background: `#0E1726`.
- Heading: white.
- Body: Slate 300.
- Accent: Slate 400 or restrained blue/brand accent.
- Surface: `#121E31`.
- Border: Slate 700 at reduced opacity.

### Default section order

1. Hero
2. How it works
3. Product preview
4. Platform / value explanation
5. Tutorial video
6. FAQ
7. Contact
8. Closing call to action

Recommended default rhythm:

| Section | Theme |
| --- | --- |
| Hero | Light |
| How it works | Dark |
| Product preview | Light |
| Platform | Dark |
| Tutorial video | Light |
| FAQ | Dark |
| Contact | Light |
| Closing CTA | Dark |

The admin dashboard controls visibility, order, and theme. If two adjacent sections use the same theme, preserve separation through spacing, a divider, or a deliberate shared composition. The admin should warn about accidental long runs of the same theme.

Internal navigation anchors must follow the configured section order. Hidden sections must not appear in navigation and must not leave empty page gaps.

---

## 7. Spacing and layout

Use an 8 px foundation with 4 px increments for compact adjustments.

| Token concept | Value | Typical use |
| --- | --- | --- |
| Micro | 4 px | Icon/text adjustment |
| Compact | 8 px | Inline gaps |
| Control gap | 12 px | Related controls |
| Base | 16 px | Card internal spacing on mobile |
| Comfortable | 24 px | Card padding and grouped regions |
| Large | 32 px | Section subdivisions |
| Section | 64–96 px | Landing vertical rhythm on desktop |

Guidance:

- Mobile page gutters: 16–20 px. At 320 px, prefer 16 px.
- Tablet gutters: 24–32 px.
- Desktop gutters: 32–64 px depending on canvas width.
- Dashboard conversation content: maximum width around `6xl`.
- Dashboard query composer: maximum width around `4xl`.
- Landing content: maximum width around `7xl`.
- Large product preview: may extend to approximately 1400 px while remaining within viewport padding.
- Avoid nested containers with repeated padding that make mobile content excessively narrow.
- The page itself must never horizontally scroll.

### Fixed application header

The dashboard header is 56 px high (`h-14`) and fixed. Page content must begin below it with matching top padding. Any full-screen panel or preview must account for this header so its title and controls are never hidden behind navigation.

### Floating landing navigation

The landing navigation is fixed, rounded, and visually floats above the page. Use a translucent white surface, restrained backdrop blur, border, and soft shadow. It may become slightly more compact and gain a clearer shadow after scrolling. Opening the mobile menu must overlay content rather than push the hero down, and choosing an item must close the menu.

---

## 8. Shape, borders, and elevation

| Element | Radius |
| --- | --- |
| Small control, compact menu item | 8 px (`rounded-lg`) |
| Button, input, standard card | 12 px (`rounded-xl`) |
| Large card, modal, composer | 16 px (`rounded-2xl`) |
| Major landing media | Up to 24 px (`rounded-3xl`) on desktop |
| Pills and circular actions | Full radius |

Use 1 px borders for grouping. Prefer soft neutral borders over shadows. Suggested elevation:

- Card: `0 1px 3px rgba(0,0,0,0.06)` or border only.
- Floating navigation: soft, broad shadow with low opacity.
- Modal/popover: stronger than a card but never harsh.

Avoid dark decorative frames around product screenshots. The image should appear as a clean product surface with a light border or subtle shadow, not as a device mockup unless the device itself is part of the story.

---

## 9. Responsive system

Build mobile-first. Required validation widths are:

- **320 px:** smallest supported phone.
- **360–390 px:** common phones.
- **768 px:** tablet.
- **1024 px:** small desktop.
- **1280 px and above:** standard desktop.

Tailwind's default breakpoints remain valid: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, and `2xl` 1536. Existing targeted breakpoints such as `min-[360px]`, `min-[380px]`, and `min-[390px]` may be used when content—not a specific device—requires them.

Responsive rules:

- Never scale down a desktop layout until text collides. Recompose it.
- No cropped product screenshots. Use `object-contain` and allow a tap-to-enlarge view on mobile.
- At 320 px, KPI cards use one column. From 360 px they may use two columns; use three at large widths and four at very wide widths.
- Replace low-priority text actions with accessible icon actions on mobile.
- Preserve a minimum 44 × 44 px touch target.
- Allow toolbars to wrap or use an overflow menu; never push content beyond the viewport.
- Sidebars may collapse to approximately 56 px and expand to approximately 240 px on desktop. On mobile they become an overlay drawer.
- Modals should be nearly full-screen on phones, with safe viewport height and internal scrolling. Desktop modals may be centered and width-constrained.
- Mobile content must remain stable while scrolling. Fixed composers and headers must not introduce horizontal shifts or cover content.

---

## 10. Component standards

### Buttons

- Primary app/admin action: Brand 500 background, white text, Brand 600 hover.
- Primary marketing action: dark neutral or theme-aware high-contrast treatment.
- Secondary action: white/transparent surface with neutral border.
- Tertiary action: text or quiet icon treatment.
- Destructive action: red treatment, separated from normal actions.
- Minimum height: 44 px; primary form actions commonly use 48 px.
- Labels begin with a clear verb: “Upload dataset,” “Start analysis,” “Save changes.”
- Show an in-control progress state and prevent duplicate submission.

### Inputs and text areas

- Standard height: 48 px.
- Radius: 12 px.
- Default border: neutral Border token.
- Focus: 2 px Brand 500 ring with clear offset where necessary.
- Labels remain visible above fields; placeholders are examples, not substitutes for labels.
- Validation appears close to the field and explains how to recover.
- Associate every field with a programmatic label.

### Cards

- Use white surfaces, a 1 px soft border, and little or no shadow.
- Keep one clear content purpose per card.
- Avoid placing cards inside cards unless the relationship requires a nested group.
- Use spacing and typography before adding more dividers.

### Navigation and sidebars

- Keep the logo, current context, and global account/credit controls stable.
- The workspace sidebar keeps **New Analysis**, **Upload Dataset**, and **View datasets** near the top so they never disappear below a long analysis history.
- The analyses list scrolls independently.
- Show sidebar search only after approximately eight analyses.
- Do not duplicate full account details in both the header and sidebar.
- Active items use a quiet brand-tinted background plus sufficient text contrast.

### Menus and popovers

- Anchor the menu to its trigger and keep it above adjacent panels.
- Close after selection, on Escape, and on safe outside interaction.
- Keep destructive options visually separated.
- Prevent menus from rendering behind a right-side Questions panel or queue panel.

### Toasts and status messages

- Place toasts where they do not cover page headings or primary navigation.
- Deduplicate repeated errors.
- Use concise copy: result first, recovery second.
- Use live regions appropriately without announcing every minor visual update.

### Dialogs

- Use a clear title, short explanation, content, and footer actions.
- Lock background scrolling while open.
- Constrain and scroll the dialog body rather than the whole page.
- Keep the close action visible at all scroll positions.
- Confirm destructive operations with the specific item name.

---

## 11. Workspace-specific patterns

### Query composer

- Resting state is compact and should not dominate mobile content.
- The text area grows naturally up to five lines, then becomes internally scrollable.
- `Enter` submits and `Shift + Enter` creates a new line.
- Clear the text immediately after a valid submission.
- If the request fails, restore the submitted query so the user can edit or retry it.
- Keep microphone and send buttons as at least 44 px circular targets.
- Use a subtle recording animation and a clear active state. Do not blink.
- Show the helper “Enter to send · Shift + Enter for a new line” when focused where space permits.
- Keep the disclaimer small and low emphasis: “Tatparya uses AI and may make mistakes. Verify important results.”

### Credits

- Normal balance: neutral treatment.
- One credit remaining: amber warning.
- Zero credits: red, with submission disabled and a direct path to get credits.
- Use a compact `+` action on narrow phones and “Get credits” on wider layouts.
- Deduct a credit only after a question completes successfully and usable output is returned.

### Empty analysis state

Show three short, clickable example questions relevant to the selected dataset. Examples should teach scope without appearing as fixed recommendations.

### Analysis actions

- Keep Questions and PDF visible when possible.
- Move Rename and Delete into an overflow menu on small screens.
- Keep Delete visually separate and clearly destructive.

### KPI cards

- Use concise labels and prominent values.
- Keep units consistent and explain abbreviations where ambiguity is possible.
- Grid: one column below 360 px, two from 360 px, three at large widths, four at `2xl`.

### Charts and data

- Charts resize to their container and never cause page-level horizontal scrolling.
- Legends wrap or move below the chart on narrow screens.
- Provide Chart and Data tabs where users need exact values.
- Keep “Download data” available but secondary.
- Expanded chart views are full-screen on mobile and contained overlays on desktop.
- Preserve readable labels; do not solve overlap by making text illegibly small.

### Dataset viewing

- Allow users to view all uploaded rows rather than an arbitrary preview limit.
- Large tables may scroll within their own region and should keep column headers visible.
- Provide loading, empty, and error states.
- Do not let wide tables expand the whole page viewport.

### Report and PDF preview

- Preview controls and title must sit below the fixed header at every size.
- Avoid embedding a desktop-width PDF viewer unchanged on mobile.
- Prefer a responsive preview shell with clear Download and Close actions.
- Generated PDFs use clean typography, generous whitespace, restrained brand color, clear section hierarchy, readable tables, and controlled page breaks.
- Raw result rows should be formatted as a table or concise evidence block, not an unbroken paragraph.
- Charts should retain labels and legends at print size.

---

## 12. Landing-page patterns

### Hero

The hero should occupy approximately the first viewport while still revealing that more content exists. Recommended order:

1. Clear product headline.
2. Minimal Upload → Ask → Decide process graphic.
3. Primary and secondary actions.

The process graphic uses sequential motion to explain the workflow. On mobile, each label and supporting line must occupy its own space; never let step descriptions collapse into one line.

### Product preview

- Present the screenshot at a useful size with no heavy outer frame.
- Use `object-contain`; never crop essential UI.
- Mobile uses the same source image, composed responsively—not a separate mobile screenshot.
- Add “Tap to enlarge” or an equally clear cue on touch devices.
- If multiple screenshots are shown, include pagination dots or a “Swipe to explore” hint.

### Tutorial video

- Keep the section hidden unless it is enabled and a valid video URL exists.
- Use a clear title, short description, accessible playback controls, poster image, and a transcript or summary where practical.
- Do not autoplay with sound.

### FAQ

- Place below the tutorial video by default.
- Use single-open or carefully managed accordions to keep the page calm.
- Questions remain scannable and keyboard accessible.

### Contact

- Place near the end of the landing page.
- Required: name, email, and message. Subject is optional.
- Show inline validation and a clear success state.
- Avoid covering the form with the back-to-top control.

### Closing call to action

- Use one clear action that matches the hero's main conversion goal.
- Do not introduce a competing destination at the bottom of the page.

---

## 13. Admin dashboard patterns

The admin dashboard is an operational product, not a second marketing site. Favor efficiency, scanability, and predictable navigation.

- Use a stable sidebar with main destinations and nested landing-page section tabs directly below “Landing page.”
- On mobile, the sidebar becomes a dismissible drawer and closes after navigation.
- Each landing section has its own editor and visibility toggle.
- The Layout & Colors editor controls section order and light/dark theme.
- Any new landing content, image, link, theme, or visibility behavior must have a corresponding admin control when editors are expected to manage it.
- Preserve template variables in email-template editors and explain which variables are available.
- Legal pages, blog visibility, plan visibility, AI provider settings, credits, roles, and verification status remain manageable from their relevant admin areas.
- At browser zoom below or above 100%, the dashboard must reflow without huge empty gutters, overlapping grids, or unreadably small content.
- Tables collapse into responsive rows/cards or provide contained horizontal scrolling on phones.
- Do not expose secrets or full provider credentials in the browser. Admin forms may submit secret values to the server, but stored secrets must be masked and server-controlled.

---

## 14. Motion and interaction

Existing motion language includes:

- Hero process sequence: approximately 6.4 seconds, using a moving beam/dot and sequential step emphasis.
- Product-preview reveal: approximately 300 ms.
- Voice recording bars: approximately 900 ms loop.
- Toast entrance and exit.

Motion guidance:

- Use 150–200 ms for small control feedback.
- Use 200–350 ms for panels, menus, and content transitions.
- Use longer loops only when explaining an ongoing process.
- Favor opacity and transform. Avoid layout-shifting height/position animation where possible.
- Recording may pulse gently; it must not flash.
- Do not animate large quantities of dashboard data on every render.
- Pause or reduce nonessential animation when the tab is not active.

Honor `prefers-reduced-motion: reduce`:

- Stop the hero sequence and show its complete static state.
- Hide traveling dots/beams if they no longer communicate accurately.
- Disable recording-bar loops while preserving a visible recording state.
- Remove nonessential preview and toast motion.

---

## 15. Accessibility requirements

- Use semantic landmarks: `header`, `nav`, `main`, `section`, `aside`, and `footer`.
- Maintain a logical heading outline with one primary page heading.
- Every icon-only button has an accessible name.
- Decorative SVGs use `aria-hidden="true"`.
- Keyboard focus is always visible with a 2 px brand outline/ring.
- Interactive targets are at least 44 × 44 px.
- Text and interactive controls meet WCAG AA contrast.
- Forms use associated labels, helpful descriptions, and actionable error messages.
- Errors use `role="alert"` when immediate interruption is justified; nonurgent updates use a status live region.
- Modal focus is contained and returns to the invoking control after close.
- Support Escape dismissal where closing cannot lose unsaved critical work.
- Images have useful alt text; decorative imagery has empty alt text.
- Videos provide controls and should provide captions/transcript when content is instructional.
- Status is never conveyed by a colored dot alone; pair it with text.
- Test with keyboard navigation, 200% zoom, and reduced-motion settings.

---

## 16. Content and voice

Tatparya's voice is plain, calm, specific, and business-friendly.

Write copy that:

- Explains the result before the implementation detail.
- Uses familiar business language instead of technical jargon.
- States what happened and what action is available next.
- Avoids hype, exaggerated certainty, and vague claims.
- Distinguishes calculated evidence from AI interpretation.

Examples:

| Avoid | Prefer |
| --- | --- |
| “Something went wrong.” | “We couldn't complete this analysis. Your question has been restored so you can try again.” |
| “Submit” | “Start analysis” |
| “Leverage AI-powered insights.” | “Ask a question and get findings supported by your data.” |
| “Invalid input.” | “Enter a valid email address, such as name@company.com.” |

Recommendations and findings should be understandable without specialist knowledge. They should reference the relevant metric, comparison, or period and explain why the next action is useful. Avoid generic, reusable recommendations that could apply to any dataset.

---

## 17. States every feature must define

Every new data-driven component must explicitly handle:

1. Initial or empty state.
2. Loading state.
3. Success state.
4. Partial-data state where applicable.
5. Error state with recovery.
6. Disabled or unavailable state.
7. Narrow-screen layout.
8. Keyboard focus state.
9. Reduced-motion state when animation is present.

Do not leave a blank card or disabled control without explaining why it is unavailable.

---

## 18. Implementation source of truth

Primary UI locations:

| Concern | Location |
| --- | --- |
| Global CSS, fonts, brand tokens, base behavior | `client/src/styles.css` |
| Font loading and document metadata | `client/index.html` |
| Reusable brand logo | `client/src/components/common/BrandLogo.jsx` |
| Brand assets | `client/public/brand/` |
| Product preview images | `client/public/dataset-preview.png`, `workspace-preview.png`, `analysis-preview.png` |
| Landing page and its sections | `client/src/components/landing/` and associated page modules |
| Dashboard/workspace UI | `client/src/components/` and relevant page modules |
| Admin content controls | Admin components and landing-content configuration modules under `client/src/` |

This document describes the intended system. Existing behavior must be inspected before editing because not every literal value has been migrated into a centralized token. If the implementation differs, preserve functional behavior and migrate visual inconsistencies deliberately rather than performing a blind global replacement.

---

## 19. Workflow for human and AI collaborators

Before changing UI:

1. Read this document and inspect the existing component in context.
2. Identify the existing token, shared component, or interaction pattern that best matches the request.
3. Preserve business behavior unless the task explicitly changes it.
4. Design mobile-first and verify at 320 px, 768 px, and 1280 px.
5. If editing a landing section, verify both light and dark themes and add/update its admin controls.
6. Check default, hover, active, focus, loading, success, error, empty, and disabled states.
7. Verify keyboard use, contrast, zoom, and reduced motion.
8. Run the relevant lint, tests, and production build.

AI-specific constraints:

- Treat this document as the default design contract.
- Do not introduce a new font, color, radius, shadow, or motion style without a documented reason.
- Avoid one-off hardcoded values when an existing role/token applies.
- Do not make desktop-only fixes. Validate the required responsive widths.
- Do not add decorative motion unless it communicates state or process.
- Do not alter API behavior, permissions, credits, or business rules for a purely visual request.
- Preserve CMS fields and backward compatibility when changing admin-managed landing content.
- Do not remove visible accessibility labels simply to create a cleaner layout.
- Prefer the smallest coherent change that solves the user problem.

---

## 20. UI review checklist

Use this checklist before merging or handing off interface work.

### Visual consistency

- [ ] Plus Jakarta Sans is used for interface text.
- [ ] Colors map to documented roles.
- [ ] Radius, border, and elevation match nearby components.
- [ ] There is one clear primary action.
- [ ] Text hierarchy is understandable without relying on color alone.

### Responsive behavior

- [ ] Verified at 320 px, 768 px, and 1280 px.
- [ ] No page-level horizontal scrolling.
- [ ] Fixed navigation and composer do not cover content.
- [ ] Text wraps without clipping or collision.
- [ ] Images and charts remain readable and are not cropped.
- [ ] Touch targets are at least 44 × 44 px.

### Interaction and states

- [ ] Loading, empty, success, error, and disabled states are intentional.
- [ ] Failed actions preserve or restore user input.
- [ ] Menus, drawers, and dialogs close predictably.
- [ ] Destructive actions are separated and confirmed where necessary.
- [ ] Feedback appears once and provides a next step.

### Accessibility

- [ ] Keyboard navigation and focus order work.
- [ ] Focus indicators are visible.
- [ ] Controls have labels and images have appropriate alt text.
- [ ] Contrast meets WCAG AA.
- [ ] Reduced motion is respected.
- [ ] Layout remains usable at 200% zoom.

### Landing and admin integration

- [ ] Landing changes work in both light and dark themes.
- [ ] New editable content is represented in the admin dashboard.
- [ ] Visibility toggles remove the section and related navigation links.
- [ ] Reordering preserves anchor navigation and visual rhythm.

---

## 21. Design decision note template

For a deliberate exception or a new reusable pattern, add a short note to the relevant pull request or project documentation:

```md
### Design decision: <short name>

- Problem: <what user or system problem is being solved>
- Decision: <the chosen pattern>
- Existing pattern reused: <component or token, if any>
- Responsive behavior: <320 px, 768 px, desktop>
- Accessibility considerations: <keyboard, contrast, labels, motion>
- Admin/CMS impact: <none or required controls>
- Reason for exception: <only if this diverges from DESIGN.md>
```

Keep this document current when a genuinely reusable visual or interaction pattern changes. Do not update it for isolated page copy or one-time content.

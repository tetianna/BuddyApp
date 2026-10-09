---
name: pom-conventions
description: Page Object Model conventions for Playwright tests in this project. Apply whenever generating, refactoring, or reviewing any Playwright test that interacts with the app under test (BuddyTime) — even if the user doesn't say "POM". Tests should never contain inline locators.
paths: tests/**, pages/**
---

# Page Object Model (BuddyApp / BuddyTime)

Specs **assert**; `pages/` **locate and act**. No inline `page.getByRole(...)` (or similar) in `tests/`.

## Steps

1. **One class** per full page or distinct UI component (`*.page.ts`, `components/*.component.ts`).
2. **Locators** — `readonly` properties set in the `constructor`; prefer `getByRole` → `getByLabel` → `getByText`; **never** CSS/XPath selectors.
3. **Methods** — user-facing actions only (`goto`, `fill`, `click`, `selectOption`); **no `expect()`** in `pages/` (move waits that support actions to `page.waitForURL` inside action methods when needed).
4. **Composition** — pages hold components (`readonly header: HeaderComponent`); **do not** extend a `BasePage`.
5. **Specs** — import POMs from `pages/`, instantiate with `new XxxPage(page)` (or `new XxxPage(altContextPage)` for the second family).

## Locator rules

- Scope **dialog** locators to `page.getByRole('dialog', { name: '…' })` (or the dialog’s accessible name) before querying inside it.
- Use `{ exact: true }` on roles when labels share a prefix (e.g. **Log in** vs **Log in with …**).
- Act on **rows and cards** by accessible name (`getByRole('row', { name })`, checkbox/link name), not by index unless the AC requires “first in list” and the POM exposes `first()` on a named group.
- **Never hardcode `APP_URL`** — use `AppRoute` from `test-data/routes.ts` in `goto()`; Playwright `baseURL` comes from `process.env.APP_URL`.
- **Header** and other chrome: `HeaderComponent` composed on each signed-in page, not inherited.
- **Two-family flows**: one POM instance per browser context (`main` page vs `alt` page); do not reuse one `Page` for both families.

## BuddyTime page inventory

From `pages/` today (routes via `AppRoute` unless noted).

| Route | Page object | Notes |
|-------|-------------|--------|
| `/` | `LandingPage` | Public marketing; Get started / Log in |
| `/login` | `LoginPage` | No `HeaderComponent` |
| `/signup` | `SignupPage` | |
| `/forgot-password` | `ForgotPasswordPage` | |
| `/app` | `DashboardPage` | `header`, invite family/co-parent panels, child add |
| `/calendar` | `CalendarPage` | |
| `/friends` | `FriendsPage` | `inviteFamilyPanel`, `manageFriendPanel` |
| `/communities` | `CommunitiesPage` | |
| `/communities/new` | `CreateCommunityPage` | `CreateCommunityFormComponent` |
| `/communities/15f52f3a-ba2f-46b7-b859-047ed8f6b50f` | `CommunityDetailPage` | Maple Class (`AppRoute.CommunityMapleClass`) |
| `/availability` | `AvailabilityPage` | |
| `/playdates` | `PlaydatesPage` | `FindPlaydateRequestFormComponent` |
| `/playdates/new` | `NewPlaydatePage` | |
| `/birthdays` | `BirthdaysPage` | `BirthdayPartyFormComponent`, upcoming list |
| `/birthdays/{partyId}` | `BirthdayPartyManagePage` | Open via **Manage →** from list (no `AppRoute` enum entry) |
| `/profile` | `ProfilePage` | `DeleteAccountFormComponent` |
| `/admin` | `AdminPage` | |

### Components (embedded; no own route)

| Component | Typical host page |
|-----------|-------------------|
| `HeaderComponent` | Signed-in pages (sidebar, banner, log out) |
| `BirthdayPartyFormComponent` | `BirthdaysPage` |
| `CreateCommunityFormComponent` | `CreateCommunityPage` |
| `DeleteAccountFormComponent` | `ProfilePage` |
| `FindPlaydateRequestFormComponent` | `PlaydatesPage` |
| `InviteCoParentPanelComponent` | `DashboardPage` |
| `InviteFamilyPanelComponent` | `DashboardPage`, `FriendsPage` |
| `ManageFriendPanelComponent` | `FriendsPage` |

`pages/index.ts` currently re-exports `LoginPage` only; other specs import concrete paths (e.g. `../pages/birthdays.page`).

## Known app issues

| Jira key | Symptom | Workaround in tests |
|----------|---------|---------------------|
| *(none)* | | |

Add a row **only** when the instructor confirms a defect. Mark the test with:

```typescript
test.fail(true, '<AQPBT-n>: <reason>');
```

## Output layout

- Page objects: `pages/` (+ `pages/components/`).
- Specs: `tests/` importing POMs (and `fixtures/cleanup.fixture` when creating data).

## Example from this repo

**POM** (`pages/login.page.ts` — trimmed):

```typescript
export class LoginPage {
  readonly emailField: Locator;
  readonly logInButton: Locator;

  constructor(private readonly page: Page) {
    this.emailField = page.getByRole('textbox', { name: 'Email' });
    this.logInButton = page.getByRole('button', { name: 'Log in', exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Login);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailField.fill(email);
  }
}
```

**Spec** (`tests/aqpbt-6-birthdays-create-party.spec.ts` — trimmed):

```typescript
test('AQPBT-6 AC1 — banner and create heading @regression', async ({ page }) => {
  const birthdaysPage = new BirthdaysPage(page);
  await birthdaysPage.goto();
  await birthdaysPage.waitForPartiesListReady();

  await expect(birthdaysPage.header.banner).toContainText('Birthdays');
  await expect(birthdaysPage.createPartyHeading).toBeVisible();
});
```

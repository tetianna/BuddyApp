# Coverage snapshot

Compared live BuddyTime (`https://test.buddytime.ca/`, app version v0.9.1) and the Confluence Feature map with specs in `tests/`.

| Page / area | Covered in specs | Notes |
|-------------|------------------|-------|
| Home `/` | Partial | `hook-probe` checks the document title only. **Get started**, **Log in**, **Privacy**, and **Terms** are not asserted. |
| Log in `/login` | Partial | `auth.storage` covers happy-path sign-in for both families. Wrong password, **Forgot password?**, **Sign up**, and `?next=` redirect are not tested. Story: AQPBT-1 (To Do). |
| Sign up `/signup` | Gap | Form is live (**Create your account**, **Your name**, **Email**, **Password (8+ characters)**, **Sign up**). No spec. Story: AQPBT-4 (To Do). |
| Forgot password `/forgot-password` | Gap | **Reset your password**, **Send reset link**, **← Back to log in**. No spec. Story: AQPBT-7 (To Do). |
| Dashboard `/app` | Gap | Greeting, stats, kids (Change avatar / remove / Add child), **Find a Playdate**, **+ Invite a family**, **Invite co-parent**, circle preview, reminders. No spec. Stories: AQPBT-2, AQPBT-5 (To Do). |
| Calendar `/calendar` | Gap | Month grid, **This week**, **Birthdays this month**. A birthday party appears on the 29th; this week was empty. Story: AQPBT-13 (To Do). Sidebar **Calendar** is clicked in AQPBT-6 AC9 only to leave Birthdays. |
| Friends `/friends` | Gap | Circle cards, **Schedule Playdate**, **manage**, **+ Invite a family**, **Explore Communities**. No spec. Story: AQPBT-14 covers manage panel only (To Do). |
| Communities list `/communities` | Gap | **Your communities**, **+ Create group**, Maple Class card. No spec. |
| Create community `/communities/new` | Gap | Create-group form exists in page objects. No spec. Story: AQPBT-3 (To Do). |
| Community hub `/communities/{id}` | Gap | Members, Events, Announcements, **Invite families**, **Copy invite link**, **Connect**. No spec and no Jira story. |
| Availability `/availability` | Gap | Weekly slots, **Weekend afternoons**, **Save availability**, one-off exceptions. No spec. Story: AQPBT-8 (To Do). |
| Playdates `/playdates` | Gap | **Find a playdate**, matched slots, **Send request**, pending/upcoming empty copy, past cancelled rows. No spec. Stories: AQPBT-9–12 (To Do). |
| Find a playdate `/playdates/new` | Gap | Same propose UI from the dashboard link. No spec. |
| Birthdays create + manage | Covered | AQPBT-6: empty list, form fields, create party, manage chrome, edit **Discard**, dismiss **Cancel party**. |
| Birthdays remaining | Partial | **Save changes**, **Send invites**, copy RSVP/guest link, confirm cancel, public guest page `/e/{token}` are not tested. |
| Profile `/profile` | Gap | Display name, family details, settings shortcuts, **Delete account…**, in-page **Log out**. No spec. |
| Admin `/admin` | Gap | **Refresh**, latest sign-ups table, **New parents per week**, **Show as table**. No spec. |
| App shell | Gap | Sidebar, **Notifications**, **Log out**, **Discover**, **Go Premium**. Discover / Premium / Notifications are “coming soon” toasts (intended). |
| Invite join `/join/{token}` | Gap | Two-family accept-invite flow. Not opened (needs a token). |
| Community join `/cg/{token}` | Gap | Public join page. Not opened (needs a token). |

# Selected gap

**Flow:** Community hub Members — see group families and **Connect** for a family that is not in the circle.
**Why this gap:** Playdates only work after families connect. Maple Class already shows **Connect** for The Ahmeds, and no spec or Jira story covers this screen.

# Gherkin test plan

Feature: Community hub — Members tab and Connect

  Signed-in Maple Class admins open the group hub to see member families
  and connect with families who are in the group but not yet in the circle.

  Background:
    Given the main practicum family is signed in

  Scenario: Host sees Connect for a group family that is not in the circle
    When they open the Maple Class community hub
    Then the banner shows "Communities"
    And the heading "Maple Class" is visible
    And the "Members" tab is selected
    And the heading "Families" is visible
    And the family card "The Ahmeds" shows button "Connect"
    And the family card "The Petrovs" shows "Connected ✓"
    And the family card "The Nguyens" shows "Connected ✓"

  Scenario: Host family card has no Connect action
    When they open the Maple Class community hub
    Then the family card "The Gorfels" shows "Your family"
    And the family card "The Gorfels" does not show button "Connect"

# Locator hints

- Banner **Communities** (`getByRole('banner')`)
- Heading **Maple Class** (`getByRole('heading', { name: 'Maple Class', level: 2 })`)
- Tab **Members** (`getByRole('tab', { name: 'Members' })`)
- Heading **Families** (`getByRole('heading', { name: 'Families', level: 3 })`)
- Family cards are `article` nodes; scope **Connect** to the article that has heading **The Ahmeds**
- **Connected ✓** text on The Petrovs and The Nguyens articles
- **Your family** on The Gorfels article
- Also on this screen (not in these two scenarios): **Invite families**, **Copy invite link**, **← All communities**

# For test-writer

- **Suggested spec:** `tests/explore-communities-connect-member.spec.ts`
- **POM updates:** `CommunityDetailPage` already has `membersTab`, `communityHeading()`, and `connectButtonForFamily(familyName)`. Add article-scoped helpers for **Your family** and **Connected ✓** if the spec needs them. Do not click **Connect** until cleanup for a connection request is defined.

# Suggested Jira story

**Title:** Community hub Members — Connect with a group family that is not in the circle
**Summary:** As a Maple Class admin, I want to see which group families are already in my circle and get a **Connect** action for families that are not, so I can grow the circle from the community hub.
**Out of scope:** Submitting **Connect** (and any accept/decline on the other family), **Invite families** / **Copy invite link**, Events and Announcements tabs, `/cg/{token}` public join.

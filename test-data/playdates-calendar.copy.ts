/** Card titles on `/playdates` and `/playdates/new` (AQPBT-12). */
export enum PlaydateListCard {
  Upcoming = 'Upcoming',
  Past = 'Past',
}

/** Count shown in the **Upcoming** card header when it is empty (AQPBT-12 AC1). */
export const EMPTY_UPCOMING_COUNT = '0' as const;

/** Empty **Upcoming** card body copy (AQPBT-12 AC1, AC3). */
export const NO_UPCOMING_PLAYDATES_COPY = 'No upcoming playdates yet.' as const;

/** Status badge on a cancelled **Past** row (AQPBT-12 AC2, AC3). */
export const CANCELLED_STATUS_LABEL = 'Cancelled' as const;

/** Date/time on the pre-existing cancelled **Past** row for the main family (AQPBT-12 AC2, AC3, AC6). */
export const CANCELLED_PAST_ROW_DATE = 'Fri, Oct 16, 3:00 PM' as const;

/** Status toast after **Calendar Sync** on Profile (AQPBT-12 AC4). */
export const CALENDAR_SYNC_TOAST_COPY = 'Calendar links ship with playdates 🗓️' as const;

/** Gate copy for a set-up family whose circle is empty (AQPBT-12 edge; observed live). */
export const EMPTY_CIRCLE_GATE_COPY =
  'Invite a trusted family first. Matches appear once your circle has at least one connection.' as const;

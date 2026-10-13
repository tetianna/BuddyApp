/** Banner text and sidebar link name on `/profile` (AQPBT-15 AC1). */
export const MY_PROFILE_TITLE = 'My Profile' as const;

/** Section label above display name and phone (AQPBT-15 AC2). */
export const YOUR_DETAILS_SECTION_LABEL = 'Your details' as const;

/** Helper text under **Phone (optional)** (AQPBT-15 AC2). */
export const PHONE_HELPER_COPY =
  'Your phone stays with your account — nobody in your circle sees it. It is kept for playdate reminders by text, which are not switched on yet.' as const;

/** Status after a successful **Save my details** (AQPBT-15 AC4). */
export const DETAILS_SAVED_STATUS = 'Your details are saved' as const;

/** Validation message for a non-phone value in **Phone (optional)** (AQPBT-15 AC3). */
export const INVALID_PHONE_MESSAGE = 'phone must be a phone number' as const;

/** Value rejected by phone validation (AQPBT-15 AC3). */
export const INVALID_PHONE_VALUE = 'abc' as const;

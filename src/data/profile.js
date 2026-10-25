// ── HOUSEHOLD PROFILE ─────────────────────────────────────────────────────
// `savedAt` is set the first time the user saves the profile sheet; until
// then the profile counts as not filled in.
export const DEFAULT_PROFILE = {
  adults: 1,
  children: 0,
  pets: 0,
  medications: false,
  mobility: false,
  elderly: false,
  meetingPoint: '',
  contactName: '',
  contactPhone: '',
  savedAt: null,
};

// Actions the user confirms or performs in the app.
//   alertsCounties: counties whose official alerts the user says they joined
//   planSharedAt:   last time the plan was shared from the Plan tab
export const DEFAULT_ACTIONS = {
  alertsCounties: [],
  planSharedAt: null,
};

export const trackEvents = [
  "page_view",
  "project_view",
  "resume_download",
  "contact_click",
  "cta_click",
  "external_link_click",
  "locale_switch",
] as const;
export type TrackEvent = (typeof trackEvents)[number];

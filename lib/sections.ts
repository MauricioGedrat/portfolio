/** Home sections in page order. The number is their position on the page. */
export const sections = ["work", "about", "lab", "experience", "skills", "resume", "contact"] as const;
export type SectionId = (typeof sections)[number];
export const sectionNumber = (id: SectionId) => String(sections.indexOf(id) + 1).padStart(2, "0");

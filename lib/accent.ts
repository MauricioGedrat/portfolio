import type { Discipline, L } from "@/content/types";
import type { SectionId } from "@/lib/sections";

export const CH = {
  ch1: "#e8d44d",
  ch2: "#4cc9ea",
  ch3: "#f2609f",
  ch4: "#5fd690",
  copper: "#ec9a5f",
} as const;
export type Channel = keyof typeof CH;

export const disciplineChannel: Record<Discipline, Channel> = {
  electronics: "ch1",
  software: "ch2",
  data: "ch3",
  embedded: "ch4",
  power: "copper",
};

export const disciplineLabel: Record<Discipline, L> = {
  electronics: { pt: "Eletrônica", en: "Electronics" },
  software: { pt: "Software", en: "Software" },
  data: { pt: "Dados", en: "Data" },
  embedded: { pt: "Embarcados", en: "Embedded" },
  power: { pt: "Potência", en: "Power" },
};

export const sectionChannel: Record<SectionId, Channel> = {
  work: "ch2",
  about: "ch3",
  lab: "ch1",
  experience: "ch4",
  skills: "copper",
  resume: "ch2",
  contact: "ch1",
};

export const cssVar = (c: Channel) => `var(--color-${c})`;
export const accent = (c: Channel) => ({ "--accent": cssVar(c) }) as React.CSSProperties;

const groupCh: Record<string, Channel> = { web: "ch2", embedded: "ch4", electronics: "ch1", data: "ch3", tools: "copper" };
/** Skill groups use the colour of the area they belong to. */
export const skillGroupChannel = (id: string): Channel => groupCh[id] ?? "ch1";

import type { Profile } from "./types";

export const profile: Profile = {
  name: "Maurício Gedrat",
  legalName: "Maurício Renck Gedrat",
  role: {
    pt: "Eletrônica × Software",
    en: "Electronics × Software",
  },
  statement: {
    pt: "Escrevo software para a web e projeto circuitos que medem, controlam e conversam com ele. Estudo no 4º ano do Técnico em Eletrônica da Fundação Liberato.",
    en: "I write software for the web and design circuits that measure, control and talk to it. I'm in the 4th year of the Electronics Technician program at Fundação Liberato.",
  },
  location: { pt: "Ivoti, RS — Brasil", en: "Ivoti, RS — Brazil" },
  seeking: {
    pt: "Procuro estágio em desenvolvimento de software a partir de 2027.",
    en: "Looking for a software development internship starting in 2027.",
  },
  email: "mauriciogedrat@gmail.com",
  links: {
    github: "https://github.com/MauricioGedrat",
    linkedin: "https://www.linkedin.com/in/mauricio-gedrat-759405213/",
  },
  languages: [
    { name: { pt: "Português", en: "Portuguese" }, level: { pt: "Nativo", en: "Native" } },
    { name: { pt: "Inglês", en: "English" }, level: { pt: "Intermediário avançado (B2)", en: "Upper-intermediate (B2)" } },
  ],
};

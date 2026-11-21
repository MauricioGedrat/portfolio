import { locales, type L, type Locale } from "@/content/types";

export { locales, type Locale };
export const defaultLocale: Locale = "pt";
export const LOCALE_COOKIE = "mg-locale";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Pick the right language from a localized value (or pass a plain string through). */
export const t = (value: L | string, locale: Locale) =>
  typeof value === "string" ? value : value[locale];

/** Swap the locale segment of a path, keeping the rest (and the hash) intact. */
export function localizedPath(pathname: string, to: Locale) {
  const parts = pathname.split("/");
  if (hasLocale(parts[1] ?? "")) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/") || `/${to}`;
}

const dictionary = {
  nav: {
    label: { pt: "Navegação principal", en: "Main navigation" },
    skip: { pt: "Pular para o conteúdo", en: "Skip to content" },
    menu: { pt: "Menu", en: "Menu" },
    close: { pt: "Fechar", en: "Close" },
    home: { pt: "Início", en: "Home" },
    sections: {
      work: { pt: "Trabalhos", en: "Work" },
      about: { pt: "Sobre", en: "About" },
      lab: { pt: "Lab", en: "Lab" },
      experience: { pt: "Trajetória", en: "Experience" },
      skills: { pt: "Habilidades", en: "Skills" },
      resume: { pt: "Currículo", en: "Resume" },
      contact: { pt: "Contato", en: "Contact" },
    },
  },
  locale: {
    label: { pt: "Idioma", en: "Language" },
    switchTo: { pt: "Read in English", en: "Ler em português" },
  },
  hero: {
    seeWork: { pt: "Ver trabalhos", en: "See the work" },
    download: { pt: "Baixar currículo", en: "Download resume" },
    award: { pt: "2º lugar na 41ª MOSTRATEC-Liberato", en: "2nd place at the 41st MOSTRATEC-Liberato" },
  },
  work: {
    title: { pt: "Trabalhos selecionados", en: "Selected work" },
    intro: {
      pt: "Do circuito no protoboard ao código no navegador. Ordenados pelo que mais importa.",
      en: "From breadboard circuits to code in the browser. Ordered by what matters most.",
    },
    open: { pt: "Abrir estudo de caso", en: "Open case study" },
    with: { pt: "com", en: "with" },
    more: { pt: "Outros trabalhos", en: "More work" },
  },
  caseStudy: {
    back: { pt: "Todos os trabalhos", en: "All work" },
    overview: { pt: "Visão geral", en: "Overview" },
    problem: { pt: "O problema", en: "The problem" },
    approach: { pt: "A abordagem", en: "The approach" },
    architecture: { pt: "Como o sistema funciona", en: "How the system works" },
    implementation: { pt: "Implementação", en: "Implementation" },
    result: { pt: "Resultado", en: "Result" },
    technologies: { pt: "Tecnologias", en: "Technologies" },
    lessons: { pt: "O que aprendi", en: "What I learned" },
    sources: { pt: "Fontes e links", en: "Sources and links" },
    media: { pt: "Registros", en: "Records" },
    year: { pt: "Ano", en: "Year" },
    context: { pt: "Contexto", en: "Context" },
    team: { pt: "Equipe", en: "Team" },
    next: { pt: "Próximo trabalho", en: "Next project" },
  },
  about: {
    title: { pt: "Sobre", en: "About" },
    who: { pt: "Quem sou", en: "Who I am" },
    build: { pt: "O que construo", en: "What I build" },
    think: { pt: "Como penso", en: "How I think" },
    learning: { pt: "O que estou aprendendo", en: "What I'm learning" },
    looking: { pt: "O que procuro", en: "What I'm looking for" },
  },
  lab: {
    title: { pt: "Lab", en: "Lab" },
    intro: {
      pt: "Três projetos para mexer direto no navegador: o gerador de funções, o controle do carrinho e o condicionador de termopar, todos com os valores reais de cada trabalho.",
      en: "Three projects to play with right in the browser: the function generator, the car remote and the thermocouple conditioner, each using the real values from the project.",
    },
  },
  experience: { title: { pt: "Trajetória", en: "Experience" } },
  skills: {
    title: { pt: "Habilidades", en: "Skills" },
    intro: {
      pt: "Cada grupo aponta os projetos que o comprovam. Passe o mouse ou toque numa habilidade para ver onde ela foi usada.",
      en: "Each group points to the projects that prove it. Point at or tap a skill to see where it was used.",
    },
    proof: { pt: "Comprovado em", en: "Proven in" },
    usedIn: { pt: "Usado em", en: "Used in" },
    noProject: { pt: "Ainda sem projeto publicado aqui.", en: "No project published here yet." },
  },
  resume: {
    title: { pt: "Currículo", en: "Resume" },
    view: { pt: "Ver currículo completo", en: "View full resume" },
    download: { pt: "Baixar PDF", en: "Download PDF" },
  },
  contact: {
    title: { pt: "Vamos construir algo.", en: "Let's build something." },
    intro: {
      pt: "Estágio, projeto ou só uma pergunta sobre um trabalho daqui. Escreva pelo e-mail ou pelo formulário.",
      en: "An internship, a project or just a question about something here. Write by e-mail or use the form.",
    },
  },
  footer: {
    built: {
      pt: "Projetado e desenvolvido por Maurício Gedrat com Next.js.",
      en: "Designed and built by Maurício Gedrat with Next.js.",
    },
  },
} as const;

type Dict = typeof dictionary;
type Resolve<T> = T extends L ? string : { [K in keyof T]: Resolve<T[K]> };

function resolve<T>(node: T, locale: Locale): Resolve<T> {
  if (node && typeof node === "object" && "pt" in node && "en" in node) {
    return (node as unknown as L)[locale] as Resolve<T>;
  }
  return Object.fromEntries(
    Object.entries(node as object).map(([k, v]) => [k, resolve(v, locale)]),
  ) as Resolve<T>;
}

const cache = new Map<Locale, Resolve<Dict>>();
export function getDictionary(locale: Locale): Resolve<Dict> {
  if (!cache.has(locale)) cache.set(locale, resolve(dictionary, locale));
  return cache.get(locale)!;
}
export type Dictionary = Resolve<Dict>;

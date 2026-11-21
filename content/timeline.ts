import type { SkillGroup, TimelineEntry } from "./types";

/** Newest first. */
export const timeline: TimelineEntry[] = [
  {
    id: "mostratec-2026",
    year: "2026",
    kind: "achievement",
    title: { pt: "2º lugar em Ciências da Computação", en: "2nd place, Computer Science" },
    place: "41ª MOSTRATEC-Liberato",
    detail: {
      pt: "Com a pesquisa sobre sentimento de notícias e retorno de ações.",
      en: "With the research on news sentiment and stock returns.",
    },
    project: "sentimento-retorno-b3",
  },
  {
    id: "carrinho-2026",
    year: "2026",
    kind: "project",
    title: { pt: "Carrinho controlado pelo navegador", en: "Browser-controlled car" },
    detail: { pt: "ESP32, BLE e Next.js.", en: "ESP32, BLE and Next.js." },
    project: "carrinho-web-bluetooth",
  },
  {
    id: "csg-2024",
    year: "2024",
    kind: "experience",
    title: { pt: "Desenvolvedor web", en: "Web developer" },
    place: "CSG Freeflow",
    detail: {
      pt: "3 meses desenvolvendo sites e aplicações web com React e TypeScript.",
      en: "3 months building websites and web apps with React and TypeScript.",
    },
  },
  {
    id: "liberato",
    year: "2023–2026",
    kind: "education",
    title: { pt: "Técnico em Eletrônica", en: "Electronics Technician" },
    place: "Fundação Escola Técnica Liberato Salzano Vieira da Cunha",
    detail: {
      pt: "Ensino médio técnico. Circuitos analógicos e digitais, microcontroladores, C e C++, automação com CLP, processamento de sinais e acionamentos.",
      en: "Technical high school. Analog and digital circuits, microcontrollers, C and C++, PLC automation, signal processing and electric drives.",
    },
  },
  {
    id: "rocketseat",
    year: "2023",
    kind: "course",
    title: { pt: "Formação em ReactJS (50 h)", en: "ReactJS specialization (50 h)" },
    place: "Rocketseat",
    detail: {
      pt: "React, SPAs, consumo de API, Next.js e aplicação full-stack.",
      en: "React, SPAs, API consumption, Next.js and a full-stack application.",
    },
  },
  {
    id: "origamid",
    year: "2021–2022",
    kind: "course",
    title: { pt: "Cursos de desenvolvimento web (188 h)", en: "Web development courses (188 h)" },
    place: "Origamid",
    detail: {
      pt: "JavaScript ES6+, React, UI Design, CSS avançado, Grid, Flexbox e Bootstrap.",
      en: "JavaScript ES6+, React, UI Design, advanced CSS, Grid, Flexbox and Bootstrap.",
    },
  },
];

export const skillGroups: SkillGroup[] = [
  {
    id: "web",
    name: { pt: "Web", en: "Web" },
    role: { pt: "Interfaces e aplicações que rodam no navegador.", en: "Interfaces and applications that run in the browser." },
    items: [
      { name: "TypeScript" },
      { name: "JavaScript" },
      { name: "React" },
      { name: "Next.js" },
      { name: "HTML" },
      { name: "CSS" },
      { name: "Tailwind CSS" },
      { name: "Web Bluetooth API" },
    ],
    proof: ["carrinho-web-bluetooth"],
  },
  {
    id: "embedded",
    name: { pt: "Embarcados", en: "Embedded" },
    role: { pt: "Firmware que liga o software ao mundo físico.", en: "Firmware that connects software to the physical world." },
    items: [{ name: "C" }, { name: "C++" }, { name: "ESP32" }, { name: "BLE" }, { name: "PWM" }],
    proof: ["carrinho-web-bluetooth"],
  },
  {
    id: "electronics",
    name: { pt: "Eletrônica", en: "Electronics" },
    role: { pt: "Circuitos que medem, condicionam e convertem sinais.", en: "Circuits that measure, condition and convert signals." },
    items: [
      { name: { pt: "Circuitos analógicos", en: "Analog circuits" } },
      { name: { pt: "Amplificadores operacionais", en: "Op-amps" } },
      { name: { pt: "Instrumentação", en: "Instrumentation" } },
      { name: { pt: "Processamento de sinais", en: "Signal processing" } },
      { name: { pt: "Eletrônica de potência", en: "Power electronics" } },
      { name: { pt: "Automação com CLP", en: "PLC automation" } },
    ],
    proof: ["condicionador-termopar-k", "gerador-de-funcoes", "sensor-temperatura-diodo", "eletronica-de-potencia"],
  },
  {
    id: "data",
    name: { pt: "Dados", en: "Data" },
    role: { pt: "Coletar, medir e testar hipóteses com números.", en: "Collecting, measuring and testing hypotheses with numbers." },
    items: [{ name: "Python" }, { name: "SQL" }, { name: { pt: "Estatística", en: "Statistics" } }, { name: { pt: "Análise de sentimento", en: "Sentiment analysis" } }],
    proof: ["sentimento-retorno-b3", "sensor-temperatura-diodo"],
  },
  {
    id: "tools",
    name: { pt: "Ferramentas", en: "Tools" },
    role: { pt: "O que uso todo dia para construir e publicar.", en: "What I use every day to build and ship." },
    items: [{ name: "Git" }, { name: "GitHub" }, { name: "Vercel" }, { name: "Supabase" }, { name: { pt: "Osciloscópio", en: "Oscilloscope" } }],
    proof: ["carrinho-web-bluetooth", "sentimento-retorno-b3"],
  },
];

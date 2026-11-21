import type { L } from "./types";

/** About, in five short answers. Every line is grounded in the resume and the projects. */
export const about: { key: "who" | "build" | "think" | "learning" | "looking"; text: L }[] = [
  {
    key: "who",
    text: {
      pt: "Estudante do 4º ano do Técnico em Eletrônica na Fundação Liberato, em Novo Hamburgo. Moro em Ivoti, no Rio Grande do Sul, e programo desde 2021.",
      en: "4th-year Electronics Technician student at Fundação Liberato, in Novo Hamburgo. I live in Ivoti, in southern Brazil, and I've been coding since 2021.",
    },
  },
  {
    key: "build",
    text: {
      pt: "Aplicações web com React, Next.js e TypeScript — e o circuito ou o firmware quando o projeto precisa sair da tela, como no carrinho que o navegador dirige por Bluetooth.",
      en: "Web applications with React, Next.js and TypeScript — plus the circuit or the firmware when a project needs to leave the screen, like the car a browser drives over Bluetooth.",
    },
  },
  {
    key: "think",
    text: {
      pt: "Começo pelo que precisa ser verdade no final: 10 mV/°C na saída, incerteza abaixo de 2%, o carrinho parando sozinho se o Bluetooth cair. Depois escolho os componentes e escrevo o código para chegar lá.",
      en: "I start from what has to be true at the end: 10 mV/°C at the output, uncertainty under 2%, the car stopping on its own if Bluetooth drops. Then I pick the parts and write the code to get there.",
    },
  },
  {
    key: "learning",
    text: {
      pt: "Python para dados e estatística, que comecei a usar a sério na pesquisa premiada na MOSTRATEC.",
      en: "Python for data and statistics, which I started using seriously in the research awarded at MOSTRATEC.",
    },
  },
  {
    key: "looking",
    text: {
      pt: "Um estágio em desenvolvimento de software a partir de 2027, que também será meu estágio curricular obrigatório.",
      en: "A software development internship starting in 2027, which will also be my mandatory curricular internship.",
    },
  },
];

/**
 * Illustrative background photos, hot-linked from Unsplash's CDN (Unsplash
 * License: free use, no permission needed). Credited in the footer.
 * They set the mood only; photos of Maurício's real work live in /public/work.
 */
export type Photo = { id: string; author: string; page: string; alt: { pt: string; en: string }; w: number; h: number };

const p = (id: string, author: string, page: string, alt: [string, string], w = 1600, h = 1067): Photo => ({
  id,
  author,
  page,
  alt: { pt: alt[0], en: alt[1] },
  w,
  h,
});

export const photos = {
  scope: p("photo-1621638363255-9c092fa8d4ab", "Doug Baney", "https://unsplash.com/photos/daADC54moaU", ["Osciloscópio digital ligado, mostrando ondas quadradas", "Digital oscilloscope showing square waves"], 1600, 1200),
  rainbowSine: p("photo-1597279393696-d5701aee7bf7", "Mitchell Y", "https://unsplash.com/photos/bxE-z_T87c0", ["Onda de luz que passa de vermelho a verde e azul no escuro", "A light wave turning from red to green and blue in the dark"]),
  yellowSine: p("photo-1668018193167-570b148406ba", "Pramod Tiwari", "https://unsplash.com/photos/Ltl68SoSSiE", ["Senoide de luz amarela no escuro", "A yellow light sine wave in the dark"], 1600, 900),
  lightWaves: p("photo-1661727866819-e42922f797c3", "Noah Pienaar", "https://unsplash.com/photos/1JCjNA8bO-w", ["Ondas de luz azuis, laranja e verdes sobre fundo preto", "Blue, orange and green light waves on black"], 1600, 1200),
  bluePcb: p("photo-1592659762303-90081d34b277", "Vishnu Mohanan", "https://unsplash.com/photos/pfR18JNEMv8", ["Placa de circuito azul-escura de perto", "Close-up of a dark blue circuit board"], 1600, 1200),
  candles: p("photo-1649003515353-c58a239cf662", "Tötös Ádám", "https://unsplash.com/photos/3r8rcSy0Ffg", ["Gráfico de candles da bolsa numa tela escura", "Stock candlestick chart on a dark screen"]),
  code: p("photo-1619410283995-43d9134e7656", "Juanjo Jaramillo", "https://unsplash.com/photos/mZnx9429i94", ["Editor de código com código React", "Code editor showing React code"]),
  tealPcb: p("photo-1651340550839-3b295d930048", "Anne Nygård", "https://unsplash.com/photos/6BCgNl-UY6A", ["Placa de circuito azul-esverdeada com indutores e CIs", "Teal circuit board with inductors and chips"]),
  goldPcb: p("photo-1617839625591-e5a789593135", "Manuel", "https://unsplash.com/photos/CANL3bzp6wU", ["Trilhas douradas numa placa de circuito", "Gold traces on a circuit board"], 1600, 1600),
  redPcb: p("photo-1580584126903-c17d41830450", "Michael Dziedzic", "https://unsplash.com/photos/aQYgUYwnCsM", ["Placa de circuito vermelha e preta", "Red and black circuit board"], 1600, 1257),
  streaks: p("photo-1621352015075-f5febf3dd690", "Rocco Stoppoloni", "https://unsplash.com/photos/HAMlweMdoVg", ["Rastros de luz laranja e branca", "Orange and white light trails"]),
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

/** Banner for each project page (atmosphere, not a photo of the project). */
export const projectBanner: Record<string, PhotoKey> = {
  "sentimento-retorno-b3": "candles",
  "carrinho-web-bluetooth": "code",
  "condicionador-termopar-k": "tealPcb",
  "gerador-de-funcoes": "rainbowSine",
  "gerador-cd4069": "goldPcb",
  "sensor-temperatura-diodo": "redPcb",
  "eletronica-de-potencia": "streaks",
};

export const unsplashUrl = (id: string, w: number, q = 72) =>
  `https://images.unsplash.com/${id}?w=${w}&q=${q}&auto=format&fit=crop`;

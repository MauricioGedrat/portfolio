import type { Project } from "./types";

/**
 * Projects ordered by importance (owner's rule: every project that names
 * Maurício Gedrat, ranked). Sources for each fact are listed in
 * docs/RESEARCH.md. Nothing here is estimated: when a result is unknown it
 * is left out instead of filled in.
 */
export const projects: Project[] = [
  {
    slug: "sentimento-retorno-b3",
    order: 1,
    featured: true,
    confidence: "verified",
    title: "Sentimento de notícias e retorno de ações: análise de risco de carteiras na bolsa brasileira",
    subtitle: {
      pt: "Pesquisa estatística sobre o tom das notícias econômicas e o retorno de ações da B3",
      en: "Statistical research on the tone of economic news and stock returns on B3, Brazil's stock exchange",
    },
    year: 2026,
    period: { pt: "Mar–out 2026", en: "Mar–Oct 2026" },
    disciplines: ["data", "software"],
    collaborators: ["Leonardo Kohn"],
    context: {
      pt: "Trabalho de Conclusão de Curso, Técnico em Eletrônica — Fundação Liberato",
      en: "Capstone project, Electronics Technician program — Fundação Liberato",
    },
    award: {
      pt: "2º lugar em Ciências da Computação — 41ª MOSTRATEC-Liberato",
      en: "2nd place, Computer Science — 41st MOSTRATEC-Liberato",
    },
    summary: {
      pt: "Testamos se o tom das notícias econômicas antecipa o retorno das ações na bolsa brasileira, com coleta de dados, análise de sentimento e testes estatísticos em Python.",
      en: "We tested whether the tone of economic news anticipates stock returns on the Brazilian exchange, using Python for data collection, sentiment analysis and statistical tests.",
    },
    problem: {
      pt: "Notícias sobre uma empresa mudam o preço da ação, ou só descrevem um movimento que já aconteceu? A pergunta parece simples, mas exige separar causa de coincidência em séries de tempo cheias de ruído.",
      en: "Does news about a company move its stock, or does it only describe a move that already happened? The question sounds simple, but answering it means separating cause from coincidence in noisy time series.",
    },
    approach: [
      {
        pt: "Coletar notícias econômicas e cotações diárias de ações da B3 no mesmo período.",
        en: "Collect economic news and daily B3 stock prices over the same period.",
      },
      {
        pt: "Classificar o tom de cada notícia com análise de sentimento (processamento de linguagem natural).",
        en: "Score the tone of each news item with sentiment analysis (natural language processing).",
      },
      {
        pt: "Buscar notícias também pelo setor da empresa, não só pelo nome — notícia sobre petróleo afeta a Petrobras mesmo sem citá-la.",
        en: "Search news by the company's sector, not just its name — oil news affects Petrobras even when it isn't mentioned.",
      },
      {
        pt: "Cruzar o tom com o retorno em defasagens diferentes, incluindo o dia anterior à notícia (D−1), para testar se o preço já tinha se movido antes.",
        en: "Cross tone with returns at different lags, including the day before the news (D−1), to test whether the price had already moved.",
      },
    ],
    chain: [
      { id: "news", label: { pt: "Notícias", en: "News" }, detail: { pt: "por empresa e por setor", en: "by company and sector" } },
      { id: "nlp", label: { pt: "Análise de sentimento", en: "Sentiment analysis" }, detail: { pt: "tom de cada notícia", en: "tone of each item" } },
      { id: "prices", label: { pt: "Cotações B3", en: "B3 prices" }, detail: { pt: "retorno diário", en: "daily returns" } },
      { id: "stats", label: { pt: "Testes estatísticos", en: "Statistical tests" }, detail: { pt: "correlação e defasagens", en: "correlation and lags" } },
      { id: "backtest", label: { pt: "Backtest D−1", en: "D−1 backtest" }, detail: { pt: "o preço se moveu antes?", en: "did the price move first?" } },
    ],
    implementation: [
      {
        pt: "Pipeline em Python: coleta, limpeza, pontuação de sentimento e alinhamento das datas das notícias com o calendário de pregões.",
        en: "Python pipeline: collection, cleaning, sentiment scoring and alignment of news dates with trading days.",
      },
      {
        pt: "Painel interativo em Streamlit para explorar os resultados por ação e por período.",
        en: "Interactive Streamlit dashboard to explore results by stock and by period.",
      },
    ],
    result: {
      pt: "O trabalho ficou em 2º lugar na área de Ciências da Computação da 41ª MOSTRATEC-Liberato, Mostra Internacional de Ciência e Tecnologia, em outubro de 2026.",
      en: "The project won 2nd place in the Computer Science category at the 41st MOSTRATEC-Liberato, an international science and technology fair, in October 2026.",
    },
    media: [
      {
        src: "/work/sentimento-retorno-b3/premiacao.webp",
        width: 1600,
        height: 1200,
        alt: {
          pt: "Maurício Gedrat e Leonardo Kohn na cerimônia de premiação, um deles mostrando a medalha",
          en: "Maurício Gedrat and Leonardo Kohn at the awards ceremony, one of them showing the medal",
        },
        caption: {
          pt: "Cerimônia de premiação da 41ª MOSTRATEC-Liberato: 2º lugar em Ciências da Computação.",
          en: "Awards ceremony at the 41st MOSTRATEC-Liberato: 2nd place in Computer Science.",
        },
      },
      {
        src: "/work/sentimento-retorno-b3/estande-mostratec.webp",
        width: 960,
        height: 1280,
        alt: {
          pt: "Maurício Gedrat e Leonardo Kohn no estande 101, em frente ao banner do projeto",
          en: "Maurício Gedrat and Leonardo Kohn at booth 101, in front of the project poster",
        },
        caption: { pt: "Estande 101 na feira.", en: "Booth 101 at the fair." },
      },
      {
        src: "/work/sentimento-retorno-b3/crachas-finalistas.webp",
        width: 1200,
        height: 1600,
        alt: {
          pt: "Crachás de finalista da MOSTRATEC em frente ao banner e ao notebook com o projeto",
          en: "MOSTRATEC finalist badges in front of the poster and the laptop running the project",
        },
        caption: { pt: "Crachás de finalista, com o banner e o projeto rodando no notebook.", en: "Finalist badges, with the poster and the project running on the laptop." },
      },
    ],
    technologies: ["Python", "NLP", "Statistics", "Streamlit", "Git"],
    sources: [
      {
        label: { pt: "Resultado oficial da premiação (PDF)", en: "Official award results (PDF)" },
        href: "http://mostratec.liberato.com.br/wp-content/uploads/2026/11/Premiacao-2026-MOSTRATEC-Imprensa.pdf",
      },
      {
        label: { pt: "Repositório do estudo", en: "Study repository" },
        href: "https://github.com/leonardokohn07/sentimento-retorno-b3",
      },
    ],
  },
  {
    slug: "carrinho-web-bluetooth",
    order: 2,
    featured: true,
    confidence: "verified",
    title: "Carrinho Web Bluetooth",
    subtitle: {
      pt: "Um site que dirige um carrinho com ESP32 pelo Bluetooth, sem instalar aplicativo",
      en: "A website that drives an ESP32 car over Bluetooth, with no app to install",
    },
    year: 2026,
    disciplines: ["embedded", "software", "electronics"],
    collaborators: ["Matheus Bizarro"],
    context: {
      pt: "Projeto do Técnico em Eletrônica — Fundação Liberato",
      en: "Electronics Technician program project — Fundação Liberato",
    },
    summary: {
      pt: "Firmware para ESP32 e um site em Next.js que controla o carrinho direto do navegador pela Web Bluetooth API.",
      en: "ESP32 firmware plus a Next.js site that controls the car straight from the browser through the Web Bluetooth API.",
    },
    problem: {
      pt: "O carrinho era controlado por aplicativos antigos de Android. A ideia era dirigir pelo navegador, no celular ou no PC, sem instalar nada — e sem quebrar os aplicativos que já funcionavam.",
      en: "The car was driven by old Android apps. The goal was to drive it from a browser, on a phone or a PC, with nothing to install — without breaking the apps that already worked.",
    },
    approach: [
      {
        pt: "A Web Bluetooth API só fala BLE, então o firmware liga os dois rádios ao mesmo tempo: BLE para o site e Bluetooth clássico para os aplicativos antigos.",
        en: "Web Bluetooth only speaks BLE, so the firmware runs both radios at once: BLE for the site and classic Bluetooth for the old apps.",
      },
      {
        pt: "Um protocolo de uma letra por comando, no serviço Nordic UART: F, B, S para tração; L, R, C para direção; 1, 2, 3 para velocidade; H para o farol.",
        en: "A one-letter-per-command protocol over the Nordic UART service: F, B, S for drive; L, R, C for steering; 1, 2, 3 for speed; H for the headlight.",
      },
      {
        pt: "O ESP32 responde o estado em 4 letras (ex.: F2C1), e o desenho do carrinho na tela acende as mesmas luzes do carrinho real.",
        en: "The ESP32 replies with its state in 4 letters (e.g. F2C1), and the car drawn on screen lights the same lamps as the real one.",
      },
    ],
    chain: [
      { id: "browser", label: { pt: "Navegador", en: "Browser" }, detail: { pt: "Next.js + Web Bluetooth", en: "Next.js + Web Bluetooth" } },
      { id: "ble", label: { pt: "BLE · Nordic UART", en: "BLE · Nordic UART" }, detail: { pt: "comandos de 1 letra", en: "1-letter commands" } },
      { id: "esp32", label: { pt: "ESP32", en: "ESP32" }, detail: { pt: "BLE + Bluetooth clássico", en: "BLE + classic Bluetooth" } },
      { id: "driver", label: { pt: "Ponte H L298N", en: "L298N H-bridge" }, detail: { pt: "PWM de tração e direção", en: "drive and steering PWM" } },
      { id: "out", label: { pt: "Motores e luzes", en: "Motors and lights" }, detail: { pt: "farol, setas, freio", en: "headlight, indicators, brake" } },
    ],
    implementation: [
      {
        pt: "Segure para andar, solte para parar. No computador: setas ou W A S D, teclas 1, 2, 3 para velocidade e H para o farol.",
        en: "Hold to drive, release to stop. On a computer: arrow keys or W A S D, keys 1, 2, 3 for speed and H for the headlight.",
      },
      {
        pt: "Segurança em duas camadas: se a aba perde o foco o site manda parar, e se o Bluetooth cai o próprio ESP32 desliga os motores.",
        en: "Two layers of safety: if the tab loses focus the site sends a stop, and if Bluetooth drops the ESP32 itself cuts the motors.",
      },
      {
        pt: "Setas e luz de freio piscam com millis(), sem delay, para o loop nunca travar enquanto chegam comandos.",
        en: "Indicators and brake lights blink with millis(), not delay, so the loop never blocks while commands arrive.",
      },
    ],
    result: {
      pt: "Funciona no Chrome e no Edge, no Android e no computador. Não funciona no iPhone nem no Firefox, que não liberam Web Bluetooth, e exige HTTPS.",
      en: "Works in Chrome and Edge on Android and desktop. It doesn't work on iPhone or Firefox, which don't support Web Bluetooth, and it requires HTTPS.",
    },
    media: [
      {
        src: "/work/carrinho-web-bluetooth/ligacoes.webp",
        width: 1600,
        height: 900,
        alt: {
          pt: "Diagrama de ligações: navegador por BLE até o ESP32, que comanda o L298N, os dois motores e os LEDs",
          en: "Wiring diagram: browser over BLE to the ESP32, which drives the L298N, both motors and the LEDs",
        },
        caption: {
          pt: "Ligações, com os pinos tirados do firmware. A alimentação não aparece no desenho.",
          en: "Wiring, with the pins taken from the firmware. Power is not shown.",
        },
      },
      {
        src: "/work/carrinho-web-bluetooth/site-desktop.webp",
        width: 1600,
        height: 1000,
        alt: {
          pt: "Site de controle no computador: botões de frente, ré, esquerda e direita ao redor do desenho do carrinho",
          en: "Control site on a computer: forward, reverse, left and right buttons around the car drawing",
        },
        caption: {
          pt: "O site no computador, em modo demonstração: andando na velocidade 2 com o farol ligado.",
          en: "The site on a computer, in demo mode: driving at speed 2 with the headlight on.",
        },
      },
      {
        src: "/work/carrinho-web-bluetooth/site-celular.webp",
        width: 780,
        height: 1828,
        alt: {
          pt: "Site de controle no celular, com o carrinho visto de cima e os botões embaixo",
          en: "Control site on a phone, with the car seen from above and the buttons below",
        },
        caption: { pt: "A mesma tela no celular.", en: "The same screen on a phone." },
      },
    ],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Web Bluetooth API", "ESP32", "Arduino (C++)", "L298N"],
    sources: [
      {
        label: { pt: "Código no GitHub", en: "Code on GitHub" },
        href: "https://github.com/MauricioGedrat/carrinho-web",
      },
    ],
  },
  {
    slug: "condicionador-termopar-k",
    order: 3,
    featured: true,
    confidence: "verified",
    title: "Condicionador de sinais para termopar tipo K",
    subtitle: {
      pt: "Do milivolt do termopar a uma saída de 10 mV/°C, com compensação de junta fria",
      en: "From thermocouple millivolts to a 10 mV/°C output, with cold-junction compensation",
    },
    year: 2026,
    disciplines: ["electronics"],
    collaborators: ["Leonardo Kohn"],
    context: {
      pt: "Processamento de Sinais — Fundação Liberato",
      en: "Signal Processing course — Fundação Liberato",
    },
    summary: {
      pt: "Circuito que converte a tensão de um termopar tipo K, de −10 a 120 °C, em uma saída linear de 10 mV/°C.",
      en: "A circuit that turns a type K thermocouple's voltage, from −10 to 120 °C, into a linear 10 mV/°C output.",
    },
    problem: {
      pt: "Em toda a faixa de −10 a 120 °C, o termopar varia só 5,312 mV. Além disso, ele mede diferença de temperatura: sem saber a temperatura da junta fria, a leitura não vale nada.",
      en: "Across −10 to 120 °C the thermocouple changes by only 5.312 mV. It also measures a temperature difference: without knowing the cold-junction temperature, the reading is meaningless.",
    },
    approach: [
      {
        pt: "Escala de saída definida primeiro: 10 mV/°C, de 0 a 1,300 V, fácil de ler em multímetro e em conversor A/D.",
        en: "Output scale chosen first: 10 mV/°C, 0 to 1.300 V, easy to read on a multimeter or an A/D converter.",
      },
      {
        pt: "Amplificador de instrumentação INA128 para o sinal diferencial pequeno, com RG de 249 Ω (ganho ≈ 201,8).",
        en: "INA128 instrumentation amplifier for the small differential signal, with a 249 Ω RG (gain ≈ 201.8).",
      },
      {
        pt: "LM35 medindo a junta fria e um TL071 somando a compensação e ajustando zero e ganho.",
        en: "An LM35 measures the cold junction, and a TL071 adds the compensation and trims zero and gain.",
      },
    ],
    chain: [
      { id: "tc", label: { pt: "Termopar K", en: "Type K thermocouple" }, detail: { pt: "5,312 mV na faixa", en: "5.312 mV over range" } },
      { id: "ina", label: { pt: "INA128", en: "INA128" }, detail: { pt: "G ≈ 201,8", en: "G ≈ 201.8" } },
      { id: "cj", label: { pt: "LM35", en: "LM35" }, detail: { pt: "junta fria", en: "cold junction" } },
      { id: "trim", label: { pt: "TL071", en: "TL071" }, detail: { pt: "zero e ganho", en: "zero and gain" } },
      { id: "out", label: { pt: "Saída", en: "Output" }, detail: { pt: "10 mV/°C", en: "10 mV/°C" } },
    ],
    implementation: [
      {
        pt: "Calibração em dois pontos para ajustar zero e ganho separadamente.",
        en: "Two-point calibration to trim zero and gain independently.",
      },
      {
        pt: "Análise de incerteza somando as fontes de erro por raiz da soma dos quadrados (RSS).",
        en: "Uncertainty analysis combining error sources by root sum of squares (RSS).",
      },
    ],
    result: {
      pt: "Incerteza total estimada de 0,59%, abaixo do limite de 2% pedido no projeto.",
      en: "Estimated total uncertainty of 0.59%, under the 2% limit the brief required.",
    },
    metrics: [
      { value: "0,59%", label: { pt: "incerteza total", en: "total uncertainty" } },
      { value: "10 mV/°C", label: { pt: "escala de saída", en: "output scale" } },
      { value: "−10–120 °C", label: { pt: "faixa medida", en: "measured range" } },
    ],
    technologies: ["INA128", "LM35", "TL071", "Instrumentation", "Calibration"],
    sources: [],
  },
  {
    slug: "gerador-de-funcoes",
    order: 4,
    featured: true,
    confidence: "verified",
    title: "Gerador de funções analógico",
    subtitle: {
      pt: "Onda quadrada, triangular e senoidal com LM311 e LM324, montado em protoboard",
      en: "Square, triangle and sine waves from an LM311 and an LM324, built on a breadboard",
    },
    year: 2026,
    disciplines: ["electronics"],
    collaborators: ["Leonardo Kohn"],
    context: {
      pt: "Processamento de Sinais — Fundação Liberato",
      en: "Signal Processing course — Fundação Liberato",
    },
    summary: {
      pt: "Gerador de funções em ±12 V que produz três formas de onda, medido e analisado no osciloscópio.",
      en: "A ±12 V function generator that produces three waveforms, measured and analysed on an oscilloscope.",
    },
    problem: {
      pt: "Construir, só com comparador e amplificadores operacionais, um gerador de faixa larga (Parte 1) e depois transformá-lo num instrumento: simetria ajustável, seleção de onda, amplitude, nível DC e um VCO (Parte 2) — medindo quanto a senoide distorce.",
      en: "Build a wide-range generator from just a comparator and op-amps (Part 1), then turn it into an instrument: adjustable symmetry, waveform selection, amplitude, DC level and a VCO (Part 2) — measuring how much the sine distorts.",
    },
    approach: [
      {
        pt: "Oscilador de relaxação: LM311 como comparador com histerese e LM324 como integrador; a senoide sai de um conformador a diodos.",
        en: "Relaxation oscillator: an LM311 hysteresis comparator and an LM324 integrator; the sine comes from a diode shaper.",
      },
      {
        pt: "Ajustes depois do primeiro teste de bancada para ampliar a faixa: P1 de 5 k para 10 k e R6 de 62 k para 33 k.",
        en: "Changes after the first bench test to widen the range: P1 from 5 k to 10 k and R6 from 62 k to 33 k.",
      },
      {
        pt: "Simetria com dois diodos e o potenciômetro P2: cada semiciclo carrega o capacitor por um lado de P2, gerando pulso e dente-de-serra.",
        en: "Symmetry with two diodes and pot P2: each half-cycle charges the capacitor through one side of P2, giving pulse and sawtooth waves.",
      },
      {
        pt: "Etapa de saída com amplificador inversor (amplitude) e somador inversor (nível DC), e um VCO com transistor 2N3904 como chave.",
        en: "Output stage with an inverting amplifier (amplitude) and an inverting summer (DC level), plus a VCO using a 2N3904 transistor as a switch.",
      },
      {
        pt: "FFT no osciloscópio Tektronix MSO2014B, lendo cada harmônica com os cursores para calcular a THD.",
        en: "FFT on a Tektronix MSO2014B oscilloscope, reading each harmonic with the cursors to compute THD.",
      },
    ],
    chain: [
      { id: "cmp", label: { pt: "Comparador", en: "Comparator" }, detail: { pt: "LM311 · quadrada", en: "LM311 · square" } },
      { id: "int", label: { pt: "Integrador", en: "Integrator" }, detail: { pt: "LM324 · triangular", en: "LM324 · triangle" } },
      { id: "shape", label: { pt: "Conformador", en: "Shaper" }, detail: { pt: "diodos · senoide", en: "diodes · sine" } },
      { id: "out", label: { pt: "Saída", en: "Output" }, detail: { pt: "amplitude · offset", en: "amplitude · offset" } },
      { id: "scope", label: { pt: "Osciloscópio", en: "Oscilloscope" }, detail: { pt: "FFT · THD", en: "FFT · THD" } },
    ],
    implementation: [
      {
        pt: "Parte 1: oscilador e conformador senoidal na protoboard, em ±12 V.",
        en: "Part 1: oscillator and sine shaper on a breadboard, at ±12 V.",
      },
      {
        pt: "Parte 2: simetria, seleção da forma de onda, amplitude, nível DC e o VCO como desafio, com os limites de cada parâmetro definidos antes do projeto.",
        en: "Part 2: symmetry, waveform selection, amplitude, DC level and the VCO as a stretch goal, with every parameter's limits set before design.",
      },
      {
        pt: "Medição de cada forma de onda nas frequências mínima e máxima e de 10 harmônicas da senoide na FFT.",
        en: "Each waveform measured at the minimum and maximum frequency, and 10 harmonics of the sine read on the FFT.",
      },
    ],
    result: {
      pt: "Na Parte 2, a saída cobriu de 0,91 kHz a ≈ 12 kHz (a meta era 1 a 10 kHz), o dente-de-serra funcionou nos dois sentidos e a THD da senoide ficou entre 3,5 % e 5,8 % em 2,38 kHz. Perto de 12 kHz as ondas começam a distorcer: o limite está no atraso do LM311 e no slew-rate de 0,5 V/µs do LM324.",
      en: "In Part 2 the output covered 0.91 kHz to ≈ 12 kHz (the target was 1 to 10 kHz), the sawtooth worked in both directions and the sine's THD was between 3.5 % and 5.8 % at 2.38 kHz. Near 12 kHz the waves start to distort: the limit is the LM311's delay and the LM324's 0.5 V/µs slew rate.",
    },
    metrics: [
      { value: "5,76–121 kHz", label: { pt: "faixa, Parte 1", en: "range, Part 1" } },
      { value: "0,91–12 kHz", label: { pt: "saída, Parte 2", en: "output, Part 2" } },
      { value: "3,5–5,8 %", label: { pt: "THD da senoide", en: "sine THD" } },
    ],
    lessons: {
      pt: "O medido ficou ≈ 0,52 vez o calculado na Parte 2 e ≈ 0,53 na Parte 1. Um fator quase constante apontou para termos fixos — tolerância do capacitor, capacitância da protoboard, atraso dos CIs — e não para erro de montagem.",
      en: "Measured values were ≈ 0.52× the calculated ones in Part 2 and ≈ 0.53× in Part 1. A nearly constant factor pointed at fixed terms — capacitor tolerance, breadboard capacitance, IC delay — rather than a wiring mistake.",
    },
    media: [
      {
        src: "/work/gerador-de-funcoes/scope-senoide-68khz.webp",
        width: 1600,
        height: 1200,
        alt: { pt: "Osciloscópio mostrando uma senoide de 68,2 kHz", en: "Oscilloscope showing a 68.2 kHz sine wave" },
        caption: { pt: "Parte 1, primeiro teste de bancada: senoide a 68,2 kHz.", en: "Part 1, first bench test: sine at 68.2 kHz." },
      },
      {
        src: "/work/gerador-de-funcoes/scope-quadrada-2-9khz.webp",
        width: 1600,
        height: 1200,
        alt: { pt: "Osciloscópio mostrando uma onda quadrada de 2,92 kHz", en: "Oscilloscope showing a 2.92 kHz square wave" },
        caption: { pt: "Parte 1: quadrada a 2,92 kHz, 12,1 V pico a pico.", en: "Part 1: square wave at 2.92 kHz, 12.1 V peak to peak." },
      },
      {
        src: "/work/gerador-de-funcoes/scope-triangular-2-9khz.webp",
        width: 1600,
        height: 1200,
        alt: { pt: "Osciloscópio mostrando uma onda triangular de 2,93 kHz", en: "Oscilloscope showing a 2.93 kHz triangle wave" },
        caption: { pt: "Parte 1: triangular na mesma frequência.", en: "Part 1: triangle wave at the same frequency." },
      },
      {
        src: "/work/gerador-de-funcoes/scope-dente-de-serra.webp",
        width: 1600,
        height: 1200,
        alt: { pt: "Osciloscópio mostrando uma onda dente-de-serra", en: "Oscilloscope showing a sawtooth wave" },
        caption: { pt: "Parte 2: com P2 num extremo, a triangular vira dente-de-serra (11,46 kHz).", en: "Part 2: with P2 at one end, the triangle becomes a sawtooth (11.46 kHz)." },
      },
      {
        src: "/work/gerador-de-funcoes/fft-fundamental.webp",
        width: 1600,
        height: 1200,
        alt: { pt: "FFT no osciloscópio com o pico da fundamental", en: "Oscilloscope FFT with the fundamental peak" },
        caption: { pt: "FFT da senoide: fundamental em 2,40 kHz, 1,67 V.", en: "Sine FFT: fundamental at 2.40 kHz, 1.67 V." },
      },
      {
        src: "/work/gerador-de-funcoes/fft-harmonicas.webp",
        width: 1600,
        height: 1200,
        alt: { pt: "FFT ampliada com cursores na 2ª e 3ª harmônicas", en: "Zoomed FFT with cursors on the 2nd and 3rd harmonics" },
        caption: { pt: "FFT ampliada: 2ª harmônica com 49,6 mV e 3ª com 32,0 mV.", en: "Zoomed FFT: 2nd harmonic at 49.6 mV, 3rd at 32.0 mV." },
      },
      {
        src: "/work/gerador-de-funcoes/esquematico-blocos.webp",
        width: 1600,
        height: 617,
        alt: { pt: "Diagrama de blocos do gerador de funções", en: "Block diagram of the function generator" },
        caption: { pt: "Como os cinco blocos se ligam.", en: "How the five blocks connect." },
      },
      {
        src: "/work/gerador-de-funcoes/esquematico-simetria-integrador.webp",
        width: 1600,
        height: 858,
        alt: { pt: "Esquemático do bloco de simetria e integrador", en: "Schematic of the symmetry and integrator block" },
        caption: { pt: "Bloco 2: simetria, ajuste de frequência e integrador.", en: "Block 2: symmetry, frequency adjustment and integrator." },
      },
    ],
    technologies: ["LM311", "LM324", "2N3904", "VCO", "Oscilloscope", "FFT"],
    sources: [],
  },
  {
    slug: "sensor-temperatura-diodo",
    order: 5,
    featured: false,
    confidence: "verified",
    title: "Diodo como sensor de temperatura",
    subtitle: {
      pt: "Um 1N4148 comum medindo temperatura, com regressão linear das medidas",
      en: "An ordinary 1N4148 measuring temperature, with linear regression of the readings",
    },
    year: 2026,
    disciplines: ["electronics", "data"],
    collaborators: ["Leonardo Kohn"],
    context: {
      pt: "Processamento de Sinais — Fundação Liberato",
      en: "Signal Processing course — Fundação Liberato",
    },
    summary: {
      pt: "A tensão de um diodo muda com a temperatura. Amplificamos essa variação e medimos o aquecimento e o resfriamento.",
      en: "A diode's voltage changes with temperature. We amplified that change and measured both heating and cooling.",
    },
    problem: {
      pt: "Usar um componente barato e comum como sensor, e descobrir se a resposta é linear o bastante para ser útil.",
      en: "Use a cheap, ordinary part as a sensor, and find out whether its response is linear enough to be useful.",
    },
    approach: [
      {
        pt: "Amplificador inversor com LM324 e ganho 10, alimentado em ±12 V. O ganho foi conferido trocando o diodo por um potenciômetro de 10 kΩ.",
        en: "Inverting amplifier with an LM324 and a gain of 10, on ±12 V. The gain was checked by swapping the diode for a 10 kΩ potentiometer.",
      },
      {
        pt: "Medidas durante o aquecimento e o resfriamento, com regressão linear e correlação de Pearson.",
        en: "Readings during heating and cooling, with linear regression and Pearson correlation.",
      },
    ],
    chain: [
      { id: "d", label: { pt: "1N4148", en: "1N4148" }, detail: { pt: "sensor", en: "sensor" } },
      { id: "amp", label: { pt: "LM324", en: "LM324" }, detail: { pt: "inversor ×10", en: "inverting ×10" } },
      { id: "data", label: { pt: "Planilha", en: "Spreadsheet" }, detail: { pt: "regressão", en: "regression" } },
    ],
    implementation: [],
    result: {
      pt: "Resposta quase perfeitamente linear: ρ = 0,9988 no aquecimento e ρ = 0,9993 no resfriamento.",
      en: "Almost perfectly linear response: ρ = 0.9988 when heating and ρ = 0.9993 when cooling.",
    },
    metrics: [
      { value: "21,72 mV/°C", label: { pt: "inclinação no aquecimento", en: "slope while heating" } },
      { value: "19,85 mV/°C", label: { pt: "inclinação no resfriamento", en: "slope while cooling" } },
    ],
    technologies: ["1N4148", "LM324", "Regression", "Excel"],
    sources: [],
  },
  {
    slug: "eletronica-de-potencia",
    order: 6,
    featured: false,
    confidence: "verified",
    title: "Práticas de Eletrônica de Potência",
    subtitle: {
      pt: "Seis práticas de laboratório: circuitos de proteção, moduladores PWM e conversores CC-CC",
      en: "Six lab practices: protection circuits, PWM modulators and DC-DC converters",
    },
    year: 2026,
    disciplines: ["power", "electronics"],
    collaborators: ["Leonardo Kohn"],
    context: {
      pt: "Eletrônica de Potência — Fundação Liberato",
      en: "Power Electronics course — Fundação Liberato",
    },
    summary: {
      pt: "Caderno de campo com seis práticas montadas e medidas em laboratório.",
      en: "A lab notebook covering six practices built and measured in the lab.",
    },
    problem: {
      pt: "Entender na bancada como se controla e converte energia: proteger cargas, gerar PWM e mudar níveis de tensão contínua.",
      en: "Learn at the bench how power is controlled and converted: protecting loads, generating PWM and changing DC voltage levels.",
    },
    approach: [
      { pt: "Circuitos de proteção.", en: "Protection circuits." },
      { pt: "Moduladores PWM.", en: "PWM modulators." },
      { pt: "Conversores CC-CC.", en: "DC-DC converters." },
    ],
    chain: [
      { id: "src", label: { pt: "Fonte", en: "Supply" } },
      { id: "pwm", label: { pt: "Modulador PWM", en: "PWM modulator" } },
      { id: "sw", label: { pt: "Chaveamento", en: "Switching" } },
      { id: "dcdc", label: { pt: "Conversor CC-CC", en: "DC-DC converter" } },
    ],
    implementation: [],
    result: {
      pt: "Seis práticas documentadas com circuitos, cálculos, medidas e figuras.",
      en: "Six practices documented with circuits, calculations, measurements and figures.",
    },
    technologies: ["PWM", "DC-DC", "Protection circuits"],
    sources: [],
  },
];

export const featuredProjects = projects.filter((p) => p.featured).sort((a, b) => a.order - b.order);
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

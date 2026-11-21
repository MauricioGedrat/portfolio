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
      pt: "Construir, só com comparador e amplificadores operacionais, um gerador com faixa de frequência larga — e verificar quanto a senoide distorce nas frequências altas.",
      en: "Build a wide-range generator from just a comparator and op-amps — and check how much the sine distorts at high frequencies.",
    },
    approach: [
      {
        pt: "LM311 como comparador e LM324 nos estágios de integração e formatação da senoide.",
        en: "LM311 as the comparator and LM324 for the integrator and sine-shaping stages.",
      },
      {
        pt: "Ajuste de componentes para ampliar a faixa: P1 de 5 k para 10 k e R6 de 62 k para 33 k.",
        en: "Component changes to widen the range: P1 from 5 k to 10 k and R6 from 62 k to 33 k.",
      },
      {
        pt: "FFT no osciloscópio Tektronix MSO2014B para medir as harmônicas da senoide na frequência máxima.",
        en: "FFT on a Tektronix MSO2014B oscilloscope to measure the sine's harmonics at the top frequency.",
      },
    ],
    chain: [
      { id: "cmp", label: { pt: "Comparador", en: "Comparator" }, detail: { pt: "LM311 · quadrada", en: "LM311 · square" } },
      { id: "int", label: { pt: "Integrador", en: "Integrator" }, detail: { pt: "LM324 · triangular", en: "LM324 · triangle" } },
      { id: "shape", label: { pt: "Formatador", en: "Shaper" }, detail: { pt: "senoide", en: "sine" } },
      { id: "scope", label: { pt: "Osciloscópio", en: "Oscilloscope" }, detail: { pt: "FFT", en: "FFT" } },
    ],
    implementation: [
      {
        pt: "Parte 2 em andamento: controles de amplitude, offset, simetria, seleção de forma de onda e VCO.",
        en: "Part 2 in progress: amplitude, offset, symmetry, waveform selection and VCO controls.",
      },
    ],
    result: {
      pt: "Faixa medida de 5,76 kHz a 121 kHz na primeira parte.",
      en: "Measured range of 5.76 kHz to 121 kHz in part one.",
    },
    metrics: [
      { value: "5,76–121 kHz", label: { pt: "faixa medida", en: "measured range" } },
      { value: "±12 V", label: { pt: "alimentação", en: "supply" } },
    ],
    status: { pt: "Parte 2 em andamento", en: "Part 2 in progress" },
    technologies: ["LM311", "LM324", "Oscilloscope", "FFT"],
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

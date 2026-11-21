# Portfólio Maurício Gedrat — Arquitetura

Documento vivo. Descreve como o site é montado, o que já existe e o que vem em cada fase.

## 1. Princípios

- **Custo zero.** Tudo roda em planos gratuitos: Vercel Hobby, Supabase Free, Resend Free, ElevenLabs Free. Nenhuma feature de IA no site.
- **Nada inventado.** Todo número, prêmio, colaborador e data no conteúdo tem fonte em `content/*.ts` (campo `sources`) ou é marcado com `confidence`.
- **Estático primeiro.** Páginas públicas são pré-renderizadas no build. Se o Supabase pausar (plano grátis pausa após inatividade), o site público continua no ar.
- **Bilíngue.** Português (padrão) e inglês, com troca manual a qualquer momento.

## 2. Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript | SSG + rotas de API no mesmo app |
| Estilo | Tailwind v4 (`@theme`) + tokens próprios | Sistema de design em CSS, sem lib de UI |
| Fonte | Archivo variável (eixo de largura 62–125%), self-hosted | O eixo de largura é parte da interação do hero |
| Movimento | rAF + `damp()` próprio; revelação por IntersectionObserver | Bundle pequeno |
| 3D | three.js, carregado sob demanda | Só desktop com pointer fino; SVG como fallback |
| Dados privados | Supabase (Postgres + Auth + RLS) | CMS e analytics |
| E-mail | Resend (fase 8) | Formulário de contato sem `mailto:` |
| Mídia gerada | ElevenLabs (imagens animadas abstratas) | Plano grátis não gera vídeo |
| Deploy | Vercel Hobby, conectado ao GitHub | Preview por branch |

## 3. Rotas

```
/                     → proxy.ts redireciona para /pt ou /en
/[lang]               → home (hero, trabalhos, sobre, lab, experiência, skills, currículo, contato)
/[lang]/work/[slug]   → estudo de caso
/[lang]/resume        → currículo em HTML (fase 7)
/api/contact          → POST do formulário (feito)
/api/messages         → caixa de mensagens com senha (feito)
/[lang]/resume        → currículo em HTML (feito)
/[lang]/studio        → CMS com senha, noindex
/api/track            → grava um evento (feito)
/api/insights         → lê o painel com senha (feito)
/api/keepalive        → cron diário que evita a pausa do Supabase
/studio               → CMS privado (fase 9), noindex, Supabase Auth
/[lang]/insights      → painel de visitas com senha, noindex (feito)
```

Escolha do idioma: cookie `mg-locale` → `Accept-Language` → `pt`. O seletor PT/EN grava o cookie e troca a rota mantendo o `#hash`.

## 4. Pastas

```
app/
  [lang]/layout.tsx        layout raiz, fonte, nav, footer
  [lang]/page.tsx          home
  [lang]/work/[slug]/      estudos de caso
  fonts/                   Archivo woff2 + OFL
  globals.css              tokens e utilitários
components/                nav, hero (scope-trace, hero-name), work-index, signal-chain…
content/                   fonte única de verdade do conteúdo (tipado, localizado)
lib/                       i18n, motion, sections
public/cv/                 PDFs do currículo
public/media/              imagens animadas (webm/mp4 + poster)
docs/                      este arquivo + RESEARCH.md
proxy.ts                   redirecionamento de idioma
```

## 5. Modelo de conteúdo

Hoje o conteúdo vive em `content/*.ts` (tipado em `content/types.ts`). Campos de texto usam `L = { pt, en }`. Títulos acadêmicos ficam sempre em português.

Ordem dos projetos (por importância):

1. Sentimento de notícias e retorno de ações — 2º lugar Ciências da Computação, 41ª MOSTRATEC (com Leonardo Kohn)
2. Carrinho Web Bluetooth — Next.js + ESP32 + BLE (com Matheus Bizarro)
3. Condicionador de termopar tipo K — INA128, compensação de junta fria
4. Gerador de funções — LM311 + LM324
5. Sensor de temperatura com diodo (não destacado)
6. Laboratórios de eletrônica de potência (não destacado)

CSG Freeflow aparece só na linha do tempo (experiência), sem estudo de caso.

## 6. Banco de dados (Supabase, fase 9+)

```sql
-- CMS
projects (id uuid pk, slug text unique, ord int, featured bool, status text check in ('draft','published'),
          data jsonb,            -- mesmo shape de content/types.ts Project
          updated_at timestamptz default now())
media    (id uuid pk, project_id uuid fk, path text, alt jsonb, kind text, created_at timestamptz)

-- Contato
messages (id uuid pk, name text, email text, body text, locale text, ip_hash text, created_at timestamptz)

-- Analytics (sem cookies de rastreamento, sem IP cru)
events   (id bigint identity pk, name text, path text, slug text, locale text,
          referrer_host text, device text, session_hash text, created_at timestamptz default now())
```

RLS: tudo fechado para `anon`, exceto `insert` em `events` e `messages` via rota de API com service role. Leitura só para o usuário admin autenticado.

Publicação: o CMS salva no Supabase e dispara um Deploy Hook da Vercel. O build lê o Supabase. Se o Supabase estiver fora, o build usa `content/*.ts` como fallback.

## 7. Analytics (feito)

Eventos: `page_view`, `project_view`, `resume_download`, `contact_click`, `cta_click`, `external_link_click`, `locale_switch`.

- O navegador manda o evento para `/api/track` (sendBeacon). A rota descarta bots, lê cidade/estado/país dos headers da Vercel e chama `track_event` no Supabase.
- Visitante = hash de IP + navegador + dia (muda todo dia, não dá para reverter). Nenhum IP é salvo, nenhum cookie.
- `public.site_events` tem RLS sem policies: ninguém lê direto. A leitura é só por `get_insights(senha, dias)`, que confere o hash bcrypt em `private.insights_secret`.
- Quem abre `/insights` e entra fica marcado no navegador (`localStorage mg-owner`) e para de ser contado.
- SQL em `supabase/migrations/0001_site_analytics.sql`. Trocar a senha: `update private.insights_secret set hash = extensions.crypt('NOVA', extensions.gen_salt('bf', 10));`

## 8. Sistema de design — "osciloscópio"

| Token | Valor | Uso |
|---|---|---|
| screen | `#0f1215` | fundo |
| panel | `#151a1e` | superfícies |
| graticule | `#262c32` | grade, divisórias leves |
| rule | `#343b42` | bordas |
| ink | `#e6e8e3` | texto |
| dim | `#8b939a` | texto secundário |
| ch1 | `#e8d44d` | só sinal ao vivo e estado ativo |
| danger | `#f0846e` | erros |

- Escala tipográfica em quarta justa (1.333). Display em Archivo 800, largura variável.
- Grade de 12 colunas (`.grid-frame`), gutter fluido.
- Durações: 160 / 320 / 700 ms, `ease-out-expo`.
- `prefers-reduced-motion` desliga toda animação contínua e deixa o traço estático.

## 9. Movimento e 3D

- **Hero (feito):** traço de osciloscópio em SVG. X do ponteiro → frequência, Y → amplitude, suavizado com `damp`. O nome muda de largura com o X do ponteiro. Pausa fora da tela.
- **Fase 3 (feito):** cascata de persistência em three.js (`components/scope-waterfall.tsx`). O traço ao vivo fica na grade da frente, com o mesmo controle pelo ponteiro, e a cada 70 ms uma cópia dele recua em profundidade. Ao rolar para fora do hero, a amplitude cai e todos os traços convergem numa linha reta. Usei three.js puro em vez de React Three Fiber: a cena é imperativa (posições atualizadas a cada quadro) e assim evita uma camada a mais. `components/hero-scope.tsx` renderiza o SVG no servidor e só baixa o 3D (≈140 KB gzip) depois do carregamento, em desktop com ponteiro fino, WebGL e sem reduced motion; o 3D entra com fade no primeiro quadro e o loop do SVG é desligado.
- **Mídia ElevenLabs:** loops curtos abstratos (placa, pulso de luz), convertidos para webm/mp4 com poster, `muted loop playsinline`, carregados com `preload="none"` fora da tela. Rotulados como ilustração. Nunca simulam foto de um projeto real.

## 10. Roadmap

| Fase | Conteúdo | Estado |
|---|---|---|
| 1 | Scaffold, design system, i18n, modelo de conteúdo | feito |
| 2 | Nav, hero, seções da home, estudos de caso | feito |
| 3 | Hero 3D (three.js) + fallback | feito |
| 4 | Título que "viaja" da lista para o estudo de caso (View Transitions), cadeia de sinal com sonda animada | feito |
| 5 | Linha do tempo com trilho que acende ao rolar; habilidades apontam os projetos que as usam | feito |
| 6 | Lab: bancada virtual do gerador de funções (osciloscópio, FFT, THD, slew-rate do LM324) | feito |
| 7 | /resume a partir dos mesmos dados, com versão de impressão; PDFs oficiais continuam para download | feito |
| 8 | Formulário de contato → Supabase (honeypot, tempo mínimo, 5/dia por visitante); mensagens no /insights | feito |
| 9–11 | /studio: edição dos textos dos projetos (PT/EN), ordem, destaque e ocultar; updateTag atualiza o site | código pronto; migração 0003 aguardando aprovação |
| 12–13 | Analytics + painel /insights | feito |
| 14–16 | sitemap, robots, imagens OG por página/projeto, JSON-LD, ícone; axe sem violações; Lighthouse mobile 96/100/100/100 | feito |

## 11. Limites dos planos grátis

- **Supabase Free:** pausa após ~1 semana sem uso → cron diário da Vercel em `/api/keepalive`.
- **Vercel Hobby:** uso não comercial, 1 cron por dia, funções com tempo limitado.
- **Resend Free:** 100 e-mails/dia, 3.000/mês; precisa de domínio verificado para enviar de um endereço próprio (sem domínio, envia de `onboarding@resend.dev` só para o próprio e-mail, o que basta para o formulário).
- **ElevenLabs Free:** 10.000 créditos/mês; imagem animada ≈ 310 créditos; vídeo exige plano pago.

"use client";

import { useRef, useState } from "react";
import { track } from "@/components/analytics";
import type { Locale } from "@/content/types";

const copy = {
  pt: {
    name: "Nome",
    email: "E-mail",
    message: "Mensagem",
    send: "Enviar mensagem",
    sending: "Enviando…",
    sent: "Mensagem enviada. Vou responder no e-mail que você informou.",
    invalid: "Confira os campos: nome, um e-mail válido e uma mensagem com pelo menos 10 caracteres.",
    limited: "Você já enviou várias mensagens hoje. Se for urgente, escreva direto para o e-mail acima.",
    error: "Não foi possível enviar agora. Escreva direto para o e-mail acima.",
    another: "Enviar outra",
  },
  en: {
    name: "Name",
    email: "E-mail",
    message: "Message",
    send: "Send message",
    sending: "Sending…",
    sent: "Message sent. I'll reply to the e-mail you gave.",
    invalid: "Check the fields: a name, a valid e-mail and a message of at least 10 characters.",
    limited: "You've already sent several messages today. If it's urgent, write to the e-mail above.",
    error: "Couldn't send right now. Write to the e-mail above instead.",
    another: "Send another",
  },
};

type Status = "idle" | "sending" | "sent" | "invalid" | "limited" | "error";

export function ContactForm({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const [status, setStatus] = useState<Status>("idle");
  const startedAt = useRef(0);
  const form = useRef<HTMLFormElement>(null);

  const onFocus = () => {
    if (!startedAt.current) startedAt.current = Date.now();
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          email: f.get("email"),
          message: f.get("message"),
          company: f.get("company"),
          locale: lang,
          startedAt: startedAt.current || Date.now(),
        }),
      });
      const { status: s } = (await res.json()) as { status: Status | "ok" };
      if (s === "ok") {
        setStatus("sent");
        track("contact_submit");
        form.current?.reset();
      } else setStatus(s === "invalid" || s === "limited" ? s : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="border-l-2 border-ch1 py-2 pl-4">
        <p className="text-lg">{c.sent}</p>
        <button type="button" onClick={() => setStatus("idle")} className="link-quiet mt-3 text-sm text-dim">
          {c.another}
        </button>
      </div>
    );
  }

  const field =
    "mt-1 w-full border border-rule bg-screen/80 px-3 py-2.5 text-ink backdrop-blur-sm transition-colors placeholder:text-dim focus:border-ink";

  return (
    <form ref={form} onSubmit={submit} onFocus={onFocus} className="grid gap-4 sm:grid-cols-2" noValidate={false}>
      <label className="block text-sm">
        <span className="text-dim">{c.name}</span>
        <input name="name" required maxLength={80} autoComplete="name" className={field} />
      </label>
      <label className="block text-sm">
        <span className="text-dim">{c.email}</span>
        <input name="email" type="email" required maxLength={120} autoComplete="email" className={field} />
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className="text-dim">{c.message}</span>
        <textarea name="message" required minLength={10} maxLength={2000} rows={5} className={`${field} resize-y`} />
      </label>
      {/* Honeypot: hidden from people, irresistible to bots. */}
      <label aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-ink px-5 py-2.5 text-sm font-semibold text-screen transition-colors hover:bg-ch1 disabled:opacity-60"
        >
          {status === "sending" ? c.sending : c.send}
        </button>
        {(status === "invalid" || status === "limited" || status === "error") && (
          <p role="alert" className="text-sm text-danger">
            {c[status]}
          </p>
        )}
      </div>
    </form>
  );
}

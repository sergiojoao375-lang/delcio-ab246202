import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { fetchWithRetry } from "@/lib/api-client";
import { DEFAULT_VOICE_ID } from "@/lib/voices";
import { recordActivity } from "@/lib/learning.functions";

export const Route = createFileRoute("/_authenticated/chamada")({
  head: () => ({
    meta: [
      { title: "Chamada com o Delcio — Delcio-English" },
      { name: "description", content: "Conversa em inglês com o Delcio em modo mãos-livres, como numa chamada telefónica." },
      { property: "og:title", content: "Chamada com o Delcio — Delcio-English" },
      { property: "og:description", content: "Põe os fones e pratica inglês a falar, sem ecrã nem teclado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CallPage,
});

type Phase = "idle" | "connecting" | "listening" | "thinking" | "speaking";
type Msg = { role: "user" | "assistant"; content: string };

const SILENCE_MS = 1300;
const VOICE_LEVEL = 0.02;

function clean(text: string) {
  return text
    .replace(/<score>[\s\S]*?<\/score>/g, "")
    .replace(/<suggestions>[\s\S]*?<\/suggestions>/g, "")
    .replace(/^🇧🇷.*$/gm, "")
    .replace(/[✏️🎉🌐⚠️]/g, "")
    .trim();
}

function CallPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);

  const active = useRef(false);
  const mutedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const history = useRef<Msg[]>([]);
  const minuteAcc = useRef(0);

  mutedRef.current = muted;

  useEffect(() => {
    if (phase === "idle" || phase === "connecting") return;
    const id = window.setInterval(() => {
      setSeconds((s) => s + 1);
      minuteAcc.current += 1;
      if (minuteAcc.current >= 60) {
        minuteAcc.current = 0;
        void recordActivity({ data: { minutes: 1, xp: 6 } }).catch(() => {});
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => () => hangUp(), []); // eslint-disable-line react-hooks/exhaustive-deps

  async function speak(text: string) {
    if (!active.current || !text) return;
    setPhase("speaking");
    setCaption(text);
    const res = await fetchWithRetry(
      "/api/tts",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: text.slice(0, 600), voiceId: DEFAULT_VOICE_ID }) },
      { timeoutMs: 45_000 },
    );
    if (!res.ok || !active.current) return;
    const audio = new Audio(URL.createObjectURL(await res.blob()));
    audioRef.current = audio;
    await new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
  }

  function recordTurn(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const stream = streamRef.current!;
      const ctx = ctxRef.current!;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported?.(t)) || "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      let spoke = false;
      let lastVoice = Date.now();
      const started = Date.now();
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        src.disconnect();
        resolve(spoke && active.current ? new Blob(chunks, { type: rec.mimeType || "audio/webm" }) : null);
      };
      rec.start(250);
      const loop = () => {
        if (!active.current) return rec.state !== "inactive" && rec.stop();
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += v * v;
        const rms = Math.sqrt(sum / buf.length);
        if (!mutedRef.current && rms > VOICE_LEVEL) {
          spoke = true;
          lastVoice = Date.now();
        }
        const silentFor = Date.now() - lastVoice;
        if ((spoke && silentFor > SILENCE_MS) || Date.now() - started > 30_000) return rec.stop();
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });
  }

  async function converse(userText: string | null) {
    if (userText) history.current.push({ role: "user", content: userText });
    setPhase("thinking");
    const res = await fetchWithRetry(
      "/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: userText
            ? history.current.slice(-12)
            : [{ role: "user", content: "(The phone call just started. Greet me warmly like a phone call and ask me one easy question.)" }],
          learningLang: "en",
          voiceMode: true,
          level: "intermediate",
        }),
      },
      { timeoutMs: 45_000 },
    );
    if (!res.ok) throw new Error(res.status === 402 ? "Os créditos de IA acabaram." : "O Delcio não conseguiu responder.");
    const { content } = (await res.json()) as { content: string };
    const text = clean(content);
    history.current.push({ role: "assistant", content: text });
    await speak(text);
  }

  async function loop() {
    try {
      await converse(null);
      while (active.current) {
        setPhase("listening");
        setCaption("");
        const blob = await recordTurn();
        if (!active.current) break;
        if (!blob) continue;
        setPhase("thinking");
        const fd = new FormData();
        fd.append("file", blob, blob.type.includes("mp4") ? "turn.mp4" : "turn.webm");
        fd.append("language", "en");
        const r = await fetchWithRetry("/api/stt", { method: "POST", body: fd }, { timeoutMs: 45_000 });
        const { text } = r.ok ? ((await r.json()) as { text: string }) : { text: "" };
        if (!text.trim() || !active.current) continue;
        setCaption(`Tu: ${text}`);
        await converse(text.trim());
      }
    } catch (e) {
      if (active.current) {
        setError(e instanceof Error ? e.message : "A chamada caiu.");
        hangUp();
      }
    }
  }

  async function call() {
    setError(null);
    setSeconds(0);
    history.current = [];
    setPhase("connecting");
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      ctxRef.current = new AudioContext();
      active.current = true;
      void loop();
    } catch {
      setPhase("idle");
      setError("Permite o acesso ao microfone para ligar ao Delcio.");
    }
  }

  function hangUp() {
    active.current = false;
    audioRef.current?.pause();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    void ctxRef.current?.close().catch(() => {});
    streamRef.current = null;
    ctxRef.current = null;
    setPhase("idle");
    setCaption("");
  }

  const inCall = phase !== "idle";
  const status = {
    idle: "Pronto para ligar",
    connecting: "A ligar…",
    listening: muted ? "Microfone desligado" : "A ouvir-te…",
    thinking: "O Delcio está a pensar…",
    speaking: "O Delcio está a falar",
  }[phase];
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-primary-dark px-6 py-10 text-primary-foreground">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-sm opacity-80 hover:underline">← Voltar</Link>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="relative">
          {(phase === "speaking" || phase === "listening") && (
            <span className="absolute inset-0 animate-ping rounded-full bg-primary-foreground/20" />
          )}
          <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-primary text-5xl font-bold">D</div>
        </div>
        <h1 className="mt-6 text-3xl font-semibold">Professor Delcio</h1>
        <p className="mt-1 opacity-80">{inCall && phase !== "connecting" ? `${mm}:${ss} · ${status}` : status}</p>
        {caption && <p className="mt-6 max-w-sm text-sm leading-relaxed opacity-90">{caption}</p>}
        {!inCall && (
          <p className="mt-6 max-w-xs text-sm opacity-80">
            Põe os fones, carrega em ligar e fala naturalmente em inglês. Quando parares de falar, o Delcio responde — não precisas de olhar para o ecrã.
          </p>
        )}
        {error && <p className="mt-4 rounded-lg bg-destructive px-3 py-2 text-sm text-destructive-foreground">{error}</p>}
      </div>

      <div className="flex items-center gap-8">
        {inCall && (
          <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Ligar microfone" : "Desligar microfone"} className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/15">
            {muted ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
          </button>
        )}
        {inCall ? (
          <button onClick={hangUp} aria-label="Desligar chamada" className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
            <PhoneOff className="h-8 w-8" />
          </button>
        ) : (
          <button onClick={() => void call()} aria-label="Ligar ao Delcio" className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-primary-foreground/20">
            <Phone className="h-8 w-8" />
          </button>
        )}
      </div>
    </main>
  );
}

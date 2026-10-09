import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { DIVISIONS, PROMOTE_TOP, getWeeklyLeague, weekEnd } from "@/lib/league.functions";

const leagueQuery = queryOptions({ queryKey: ["league"], queryFn: () => getWeeklyLeague() });

export const Route = createFileRoute("/_authenticated/liga")({
  head: () => ({
    meta: [
      { title: "Liga semanal — Delcio-English" },
      { name: "description", content: "Compete com outros alunos na liga semanal: Bronze, Prata, Ouro e Diamante." },
      { property: "og:title", content: "Liga semanal — Delcio-English" },
      { property: "og:description", content: "Ganha XP, sobe de divisão e não percas a tua posição." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(leagueQuery),
  component: LeaguePage,
  errorComponent: () => <main className="p-8 text-center text-muted-foreground">Não foi possível carregar a liga.</main>,
});

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const ms = Math.max(0, target.getTime() - now);
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return d > 0 ? `${d}d ${h}h` : `${h}h ${m}min`;
}

function LeaguePage() {
  const { data } = useSuspenseQuery(leagueQuery);
  const left = useCountdown(weekEnd(data.week_start));
  const top = data.division >= DIVISIONS.length - 1;

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary to-accent px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-primary-dark">
            <Trophy className="h-6 w-6 text-primary" /> Liga semanal
          </h1>
          <Link to="/" className="text-sm text-primary hover:underline">Voltar ao chat</Link>
        </div>

        {data.promoted && (
          <div className="rounded-2xl border border-primary bg-primary/10 p-4 text-sm font-medium text-primary-dark">
            🎉 Subiste para a Divisão {DIVISIONS[data.division]}! Parabéns pela semana fantástica.
          </div>
        )}

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">A tua divisão</p>
              <p className="text-2xl font-bold text-primary-dark">Divisão {DIVISIONS[data.division]}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">A semana fecha em</p>
              <p className="text-lg font-semibold">{left}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-1.5">
            {DIVISIONS.map((d, i) => (
              <div key={d} className={`flex-1 rounded-lg py-1.5 text-center text-xs font-medium ${i === data.division ? "bg-primary text-primary-foreground" : i < data.division ? "bg-primary/30" : "bg-secondary text-muted-foreground"}`}>
                {d}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Cada conversa, aula, exercício e palavra revista dá XP.{" "}
            {top ? "Estás na divisão mais alta — defende o teu lugar!" : `Os ${PROMOTE_TOP} melhores sobem de divisão no domingo à meia-noite.`}
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-2">
          <ol>
            {data.rows.map((r, i) => (
              <li key={i}>
                {i === PROMOTE_TOP && !top && (
                  <div className="my-1 border-t-2 border-dashed border-primary/40 px-3 pt-1 text-[11px] text-primary">zona de subida ↑</div>
                )}
                <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${r.is_me ? "bg-primary/10 font-semibold" : ""}`}>
                  <span className="w-6 text-center text-sm text-muted-foreground">
                    {i === 0 ? <Crown className="mx-auto h-4 w-4 text-primary" /> : i < 3 ? <Medal className="mx-auto h-4 w-4 text-primary/70" /> : i + 1}
                  </span>
                  <span className="flex-1 truncate">{r.name}{r.is_me && " (tu)"}</span>
                  <span className="text-sm">{r.xp} XP</span>
                </div>
              </li>
            ))}
          </ol>
          {data.rows.length <= 1 && (
            <p className="p-3 text-center text-sm text-muted-foreground">
              Ainda estás sozinho nesta divisão. Convida amigos para competirem contigo!
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Headphones } from "lucide-react";
import { STORIES } from "@/lib/stories";

export const Route = createFileRoute("/_authenticated/historias/")({
  head: () => ({
    meta: [
      { title: "Histórias em áudio — Delcio-English" },
      { name: "description", content: "Mini-histórias narradas em inglês onde tu escolhes o que acontece a seguir." },
      { property: "og:title", content: "Histórias em áudio — Delcio-English" },
      { property: "og:description", content: "Ouve, escolhe e aprende inglês sem pressão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StoriesPage,
});

function StoriesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary to-accent px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-primary-dark">
            <Headphones className="h-6 w-6 text-primary" /> Histórias em áudio
          </h1>
          <Link to="/" className="text-sm text-primary hover:underline">Voltar ao chat</Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Ouve com calma. Nos momentos importantes, a história pára e és tu quem decide o que dizer.
        </p>
        <div className="grid gap-3">
          {STORIES.map((s) => (
            <Link key={s.id} to="/historias/$id" params={{ id: s.id }} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary">
              <span className="text-4xl">{s.emoji}</span>
              <span>
                <span className="block font-semibold text-primary-dark">{s.titlePt}</span>
                <span className="block text-sm text-muted-foreground">{s.title} · {s.level} · 2–3 min</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

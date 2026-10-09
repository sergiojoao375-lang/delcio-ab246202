import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Languages, Loader2, Play, RotateCcw } from "lucide-react";
import { getStory } from "@/lib/stories";
import { speakText } from "@/lib/tts-client";
import { recordActivity } from "@/lib/learning.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/historias/$id")({
  loader: ({ params }) => {
    const story = getStory(params.id);
    if (!story) throw notFound();
    return { title: story.titlePt };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "História"} — Delcio-English` },
      { name: "description", content: "História interativa narrada em inglês: ouve e escolhe o caminho." },
      { property: "og:title", content: `${loaderData?.title ?? "História"} — Delcio-English` },
      { property: "og:description", content: "Ouve, escolhe e aprende inglês sem pressão." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StoryPage,
  notFoundComponent: () => <main className="p-8 text-center">História não encontrada.</main>,
});

function StoryPage() {
  const { id } = Route.useParams();
  const story = getStory(id)!;
  const [path, setPath] = useState<string[]>([story.start]);
  const [showPt, setShowPt] = useState(false);
  const [loading, setLoading] = useState(false);
  const rewarded = useRef(false);
  const node = story.nodes[path[path.length - 1]!]!;

  async function narrate(text: string) {
    setLoading(true);
    try {
      await speakText(text, 0.9);
    } catch {
      /* audio optional */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (path.length > 1) void narrate(node.text);
    if (node.end && !rewarded.current) {
      rewarded.current = true;
      void recordActivity({ data: { xp: 15, exercises: 1 } }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path.length]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary to-accent px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <Link to="/historias" className="text-sm text-primary hover:underline">← Histórias</Link>
          <button onClick={() => setShowPt((v) => !v)} className="flex items-center gap-1 text-sm text-primary">
            <Languages className="h-4 w-4" /> {showPt ? "Esconder tradução" : "Ver tradução"}
          </button>
        </div>
        <h1 className="text-2xl font-bold text-primary-dark">{story.emoji} {story.title}</h1>

        {path.map((nid, i) => {
          const n = story.nodes[nid]!;
          return (
            <section key={i} className={`rounded-2xl border border-border bg-card p-5 ${i < path.length - 1 ? "opacity-60" : ""}`}>
              <p className="text-lg leading-relaxed">{n.text}</p>
              {showPt && <p className="mt-2 text-sm italic text-muted-foreground">{n.pt}</p>}
              {i === path.length - 1 && (
                <Button variant="outline" size="sm" className="mt-3" disabled={loading} onClick={() => void narrate(n.text)}>
                  {loading ? <Loader2 className="animate-spin" /> : <Play />} Ouvir
                </Button>
              )}
            </section>
          );
        })}

        {node.choices && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">O que fazes?</p>
            {node.choices.map((c) => (
              <button key={c.next + c.label} onClick={() => setPath((p) => [...p, c.next])} className="block w-full rounded-xl border border-input bg-card p-4 text-left transition hover:border-primary hover:bg-accent">
                <span className="block font-medium">{c.label}</span>
                <span className="block text-xs text-muted-foreground">{c.pt}</span>
              </button>
            ))}
          </div>
        )}

        {node.end && (
          <div className="rounded-2xl border border-primary bg-primary/10 p-5 text-center">
            <p className="font-semibold text-primary-dark">Fim! +15 XP para a tua liga 🏆</p>
            <Button className="mt-3" variant="outline" onClick={() => setPath([story.start])}>
              <RotateCcw /> Tentar outro caminho
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

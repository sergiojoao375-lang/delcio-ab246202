import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const DIVISIONS = ["Bronze", "Prata", "Ouro", "Diamante"] as const;
export const PROMOTE_TOP = 5;

export type LeagueRow = { name: string; xp: number; is_me: boolean };
export type League = { division: number; week_start: string; promoted: boolean; rows: LeagueRow[] };

/** Monday 00:00 UTC of the next week = the moment the week closes (Sunday midnight). */
export function weekEnd(weekStart: string): Date {
  return new Date(new Date(`${weekStart}T00:00:00Z`).getTime() + 7 * 86_400_000);
}

export const getWeeklyLeague = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<League> => {
    const { data, error } = await context.supabase.rpc("get_weekly_league");
    if (error) throw new Error(error.message);
    return data as unknown as League;
  });

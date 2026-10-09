CREATE TABLE public.league_members (
  user_id uuid PRIMARY KEY,
  division integer NOT NULL DEFAULT 0,
  week_start date NOT NULL DEFAULT (date_trunc('week', now()))::date,
  prev_division integer,
  prev_week date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.league_members TO authenticated;
GRANT ALL ON public.league_members TO service_role;
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own league row" ON public.league_members FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.get_weekly_league()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _cur date := (date_trunc('week', now()))::date;
  _me public.league_members;
  _rank integer;
  _new_div integer;
  _promoted boolean := false;
  _rows jsonb;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  INSERT INTO public.league_members(user_id, division, week_start)
  VALUES (_uid, 0, _cur) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO _me FROM public.league_members WHERE user_id = _uid FOR UPDATE;

  IF _me.week_start < _cur THEN
    WITH grp AS (
      SELECT m.user_id FROM public.league_members m
      WHERE (m.week_start = _me.week_start AND m.division = _me.division)
         OR (m.prev_week = _me.week_start AND m.prev_division = _me.division)
    ), scored AS (
      SELECT g.user_id, COALESCE(SUM(a.xp), 0) AS xp
      FROM grp g LEFT JOIN public.daily_activity a
        ON a.user_id = g.user_id AND a.day >= _me.week_start AND a.day < _me.week_start + 7
      GROUP BY g.user_id
    )
    SELECT r INTO _rank FROM (
      SELECT user_id, rank() OVER (ORDER BY xp DESC) AS r, xp FROM scored
    ) s WHERE s.user_id = _uid AND s.xp > 0;

    _new_div := _me.division;
    IF _rank IS NOT NULL AND _rank <= 5 AND _me.division < 3 THEN
      _new_div := _me.division + 1; _promoted := true;
    END IF;
    UPDATE public.league_members
      SET prev_division = _me.division, prev_week = _me.week_start,
          division = _new_div, week_start = _cur, updated_at = now()
      WHERE user_id = _uid;
    SELECT * INTO _me FROM public.league_members WHERE user_id = _uid;
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.xp DESC, t.name), '[]'::jsonb) INTO _rows FROM (
    SELECT COALESCE(NULLIF(p.display_name, ''), 'Aluno') AS name,
           COALESCE(SUM(a.xp), 0)::int AS xp,
           (m.user_id = _uid) AS is_me
    FROM public.league_members m
    LEFT JOIN public.profiles p ON p.id = m.user_id
    LEFT JOIN public.daily_activity a ON a.user_id = m.user_id AND a.day >= _cur
    WHERE m.week_start = _cur AND m.division = _me.division
    GROUP BY m.user_id, p.display_name
    ORDER BY xp DESC
    LIMIT 30
  ) t;

  RETURN jsonb_build_object(
    'division', _me.division,
    'week_start', _cur,
    'promoted', _promoted AND _me.prev_week = _cur - 7,
    'rows', _rows
  );
END;
$$;
REVOKE ALL ON FUNCTION public.get_weekly_league() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_weekly_league() TO authenticated;
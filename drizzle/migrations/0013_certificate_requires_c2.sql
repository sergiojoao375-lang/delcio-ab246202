ALTER TABLE public.course_certificates ALTER COLUMN level SET DEFAULT 'proficient';
ALTER TABLE public.course_certificates ALTER COLUMN course_title SET DEFAULT 'Complete English Course';
CREATE OR REPLACE FUNCTION public.issue_course_certificate(_full_name text, _id_document_type text, _id_document_number text)
RETURNS public.course_certificates LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _user_id uuid := auth.uid();
  _final_score integer;
  _certificate public.course_certificates;
  _clean_name text := regexp_replace(trim(coalesce(_full_name, '')), '\s+', ' ', 'g');
  _clean_doc text := upper(regexp_replace(trim(coalesce(_id_document_number, '')), '\s+', '', 'g'));
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'É necessário iniciar sessão.'; END IF;
  IF char_length(_clean_name) < 2 OR char_length(_clean_name) > 100 THEN RAISE EXCEPTION 'Confirme o seu nome completo.'; END IF;
  IF _id_document_type IS NULL OR _id_document_type NOT IN ('bi', 'passport') THEN RAISE EXCEPTION 'Escolha Bilhete de Identidade ou Passaporte.'; END IF;
  IF _clean_doc !~ '^[A-Z0-9-]{5,20}$' THEN RAISE EXCEPTION 'Indique um número de documento válido.'; END IF;
  SELECT * INTO _certificate FROM public.course_certificates WHERE user_id = _user_id;
  IF FOUND THEN RETURN _certificate; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.learner_profiles WHERE user_id = _user_id AND level = 'proficient' AND placement_done = true) THEN
    RAISE EXCEPTION 'Conclua o nível Proficiente (C2) antes de pedir o certificado.';
  END IF;
  SELECT score INTO _final_score FROM public.level_tests
  WHERE user_id = _user_id AND kind = 'final' AND status = 'done' AND passed = true AND score >= 70 AND from_level = 'proficient' AND to_level = 'proficient'
  ORDER BY created_at DESC LIMIT 1;
  IF _final_score IS NULL THEN RAISE EXCEPTION 'É necessário passar o exame final do nível C2.'; END IF;
  INSERT INTO public.course_certificates (user_id, full_name, course_title, level, final_score, id_document_type, id_document_number)
  VALUES (_user_id, _clean_name, 'Complete English Course', 'proficient', _final_score, _id_document_type, _clean_doc)
  RETURNING * INTO _certificate;
  RETURN _certificate;
END;
$$;
REVOKE ALL ON FUNCTION public.issue_course_certificate(text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_course_certificate(text,text,text) TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.issue_course_certificate(_full_name text)
RETURNS public.course_certificates LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RAISE EXCEPTION 'Indique o nome completo e o número do Bilhete de Identidade ou Passaporte.';
END;
$$;
REVOKE ALL ON FUNCTION public.issue_course_certificate(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_course_certificate(text) TO authenticated, service_role;
COMMENT ON FUNCTION public.issue_course_certificate(text) IS 'DEPRECATED: use the identity-document overload; new certificates require a passed C2 final exam.';
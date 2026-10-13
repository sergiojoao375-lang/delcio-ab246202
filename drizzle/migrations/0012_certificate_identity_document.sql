ALTER TABLE public.course_certificates ADD COLUMN IF NOT EXISTS id_document_type text, ADD COLUMN IF NOT EXISTS id_document_number text;
ALTER TABLE public.course_certificates ADD CONSTRAINT course_certificates_id_doc_type_chk CHECK (id_document_type IS NULL OR id_document_type IN ('bi','passport'));

CREATE OR REPLACE FUNCTION public.issue_course_certificate(_full_name text, _id_document_type text, _id_document_number text)
RETURNS public.course_certificates
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _final_score integer;
  _certificate public.course_certificates;
  _clean_name text := regexp_replace(trim(_full_name), '\s+', ' ', 'g');
  _clean_doc text := upper(regexp_replace(trim(coalesce(_id_document_number,'')), '\s+', '', 'g'));
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF char_length(_clean_name) < 2 OR char_length(_clean_name) > 100 THEN RAISE EXCEPTION 'Invalid full name'; END IF;
  IF _id_document_type NOT IN ('bi','passport') THEN RAISE EXCEPTION 'Invalid document type'; END IF;
  IF _clean_doc !~ '^[A-Z0-9-]{5,20}$' THEN RAISE EXCEPTION 'Invalid document number'; END IF;

  SELECT score INTO _final_score FROM public.level_tests
  WHERE user_id = _user_id AND kind = 'final' AND status = 'done' AND passed = true
  ORDER BY created_at DESC LIMIT 1;
  IF _final_score IS NULL THEN RAISE EXCEPTION 'Final exam not passed'; END IF;

  SELECT * INTO _certificate FROM public.course_certificates WHERE user_id = _user_id;
  IF FOUND THEN RETURN _certificate; END IF;

  INSERT INTO public.course_certificates (user_id, full_name, final_score, id_document_type, id_document_number)
  VALUES (_user_id, _clean_name, _final_score, _id_document_type, _clean_doc)
  RETURNING * INTO _certificate;
  RETURN _certificate;
END;
$$;
REVOKE ALL ON FUNCTION public.issue_course_certificate(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.issue_course_certificate(text, text, text) TO authenticated, service_role;
COMMENT ON FUNCTION public.issue_course_certificate(text) IS 'DEPRECATED: use issue_course_certificate(text, text, text) with identity document';
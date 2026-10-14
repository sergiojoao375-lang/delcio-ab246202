import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { canTakeFinalExam } from "@/lib/levels";

export const CERTIFICATE_DELAY_MS = 24 * 60 * 60 * 1000;

export function isCertificateAvailable(issuedAt: string, now = Date.now()) {
  return now >= new Date(issuedAt).getTime() + CERTIFICATE_DELAY_MS;
}

function mapCertificate(row: any) {
  return {
    id: row.id as string,
    verificationCode: row.verification_code as string,
    fullName: row.full_name as string,
    courseTitle: row.course_title as string,
    level: row.level as string,
    finalScore: row.final_score as number,
    issuedAt: row.issued_at as string,
    idDocumentType: (row.id_document_type ?? null) as "bi" | "passport" | null,
    idDocumentNumber: (row.id_document_number ?? null) as string | null,
    availableAt: new Date(new Date(row.issued_at).getTime() + CERTIFICATE_DELAY_MS).toISOString(),
  };
}

export const getMyCertificate = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("course_certificates")
      .select("id, verification_code, full_name, course_title, level, final_score, issued_at, id_document_type, id_document_number")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapCertificate(data) : null;
  });

export const getCertificateStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: profile }, { data: finalTest }, { data: identity }] = await Promise.all([
      context.supabase.from("learner_profiles").select("level, placement_done").eq("user_id", context.userId).maybeSingle(),
      context.supabase.from("level_tests").select("score").eq("user_id", context.userId).eq("kind", "final").eq("from_level", "proficient").eq("to_level", "proficient").eq("status", "done").eq("passed", true).gte("score", 70).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      context.supabase.from("profiles").select("display_name").eq("id", context.userId).maybeSingle(),
    ]);
    return {
      eligibleForFinal: canTakeFinalExam(profile?.level ?? "", profile?.placement_done === true),
      finalPassed: canTakeFinalExam(profile?.level ?? "", profile?.placement_done === true) && !!finalTest,
      finalScore: finalTest?.score ?? null,
      suggestedName: identity?.display_name ?? "",
    };
  });

export const issueMyCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { fullName: string; idDocumentType: "bi" | "passport"; idDocumentNumber: string }) => d)
  .handler(async ({ data, context }) => {
    const fullName = data.fullName.trim().replace(/\s+/g, " ");
    if (fullName.length < 2 || fullName.length > 100) throw new Error("Confirme o seu nome completo.");
    if (data.idDocumentType !== "bi" && data.idDocumentType !== "passport") throw new Error("Escolha Bilhete de Identidade ou Passaporte.");
    const doc = data.idDocumentNumber.replace(/\s+/g, "").toUpperCase();
    if (!/^[A-Z0-9-]{5,20}$/.test(doc)) throw new Error("Indique um número de documento válido (5 a 20 letras ou números).");
    const { data: row, error } = await context.supabase.rpc("issue_course_certificate", {
      _full_name: fullName,
      _id_document_type: data.idDocumentType,
      _id_document_number: doc,
    });
    if (error) throw new Error(error.message);
    return mapCertificate(row);
  });

export const verifyCertificate = createServerFn({ method: "GET" })
  .inputValidator((d: { code: string }) => d)
  .handler(async ({ data }) => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.code)) {
      return null;
    }
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });
    const { data: rows, error } = await client.rpc("verify_course_certificate", {
      _verification_code: data.code,
    });
    if (error) throw new Error("Não foi possível verificar este certificado.");
    const row = rows?.[0];
    return row ? mapCertificate({ ...row, id: row.verification_code }) : null;
  });
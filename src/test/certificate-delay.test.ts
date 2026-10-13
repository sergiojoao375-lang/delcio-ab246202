import { describe, it, expect } from "vitest";
import { isCertificateAvailable } from "@/lib/certificate.functions";
describe("certificado disponível após 24 horas", () => {
  const issued = "2026-10-13T10:00:00.000Z";
  it("não disponível 23h59 depois", () => { expect(isCertificateAvailable(issued, Date.parse("2026-10-14T09:59:00.000Z"))).toBe(false); });
  it("disponível 24h depois", () => { expect(isCertificateAvailable(issued, Date.parse("2026-10-14T10:00:00.000Z"))).toBe(true); });
});

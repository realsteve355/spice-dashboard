import { useState } from "react";
import { C, F } from "../tokens";
import SectionHead from "../components/spice/SectionHead";

const S = {
  page:  { background: C.bg, color: C.txt, fontFamily: F.mono, minHeight: "calc(100vh - 57px)" },
  inner: { maxWidth: 640, margin: "0 auto", padding: "48px 36px 80px" },
  lead:  { fontSize: 14.5, color: C.txt2, lineHeight: 1.7, marginBottom: 32 },

  field:   { marginBottom: 18 },
  label:   { display: "block", fontSize: 11, color: C.dim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 },
  input:   {
    width: "100%", boxSizing: "border-box", background: C.panel, border: `1px solid ${C.line}`,
    color: C.txt, fontFamily: F.mono, fontSize: 13, padding: "11px 12px", outline: "none",
  },
  checkRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
  checkLabel: { fontSize: 13, color: C.txt2 },

  submit: {
    fontFamily: F.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase",
    padding: "13px 24px", cursor: "pointer", background: C.txt, color: C.bg, border: `1px solid ${C.txt}`,
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.5, cursor: "default" },
  error:   { fontSize: 12, color: C.crit, marginBottom: 16 },

  doneWrap: { textAlign: "center", padding: "40px 0" },
  doneTitle: { fontSize: 18, color: C.headline, fontWeight: 600, marginBottom: 10 },
  doneBody:  { fontSize: 13, color: C.txt2, lineHeight: 1.7 },
};

export default function RequestAccess() {
  const [form, setForm] = useState({
    name: "", email: "", organization: "",
    interestedInvestor: false, interestedPilotSite: false,
  });
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone]   = useState(false);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return; }
    setBusy(true); setError(null);
    try {
      const r = await fetch("/api/beta-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Could not submit request.");
      setDone(true);
    } catch (err) {
      setError(err.message || "Could not submit request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <SectionHead tag="C-01" title="iOS App · Closed Beta" timestamp="REQUEST ACCESS" />

        {done ? (
          <div style={S.doneWrap}>
            <div style={S.doneTitle}>Request received</div>
            <p style={S.doneBody}>
              Thanks — we'll be in touch once a spot opens up in the beta. The app is
              currently in closed testing ahead of a full App Store release.
            </p>
          </div>
        ) : (
          <>
            <p style={S.lead}>
              Mond Pay for iPhone is in closed beta ahead of a full release — tap-to-pay
              with NFC and Face ID, the native wallet experience (Android to follow).
              Leave your details and we'll send you an invite as capacity allows.
            </p>

            <form onSubmit={submit}>
              <div style={S.field}>
                <label style={S.label}>Name *</label>
                <input style={S.input} value={form.name} onChange={set("name")} placeholder="Jane Q. Public" />
              </div>
              <div style={S.field}>
                <label style={S.label}>Email *</label>
                <input style={S.input} type="email" value={form.email} onChange={set("email")} placeholder="jane@example.com" />
              </div>
              <div style={S.field}>
                <label style={S.label}>Organization (optional)</label>
                <input style={S.input} value={form.organization} onChange={set("organization")} placeholder="Company / institution" />
              </div>

              <div style={S.checkRow}>
                <input type="checkbox" id="investor" checked={form.interestedInvestor} onChange={set("interestedInvestor")} />
                <label htmlFor="investor" style={S.checkLabel}>I'm interested as a potential investor</label>
              </div>
              <div style={S.checkRow}>
                <input type="checkbox" id="pilot" checked={form.interestedPilotSite} onChange={set("interestedPilotSite")} />
                <label htmlFor="pilot" style={S.checkLabel}>I'm interested in AXION as a live pilot site</label>
              </div>

              {error && <div style={S.error}>{error}</div>}
              <button type="submit" disabled={busy} style={{ ...S.submit, ...(busy ? S.submitDisabled : {}) }}>
                {busy ? "Submitting…" : "Request access →"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

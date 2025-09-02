import { useEffect, useMemo, useState } from "react";
import { Users } from "./api";
import useDebounce from "./useDebounce";
import Snackbar from "./Snackbar";
import "./App.css";

export default function App() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "" });
  const [emailError, setEmailError] = useState("");
  const [q, setQ] = useState("");
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", type: "info" });
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });

  // NEU: Serverseitige Sortierung
  const [sort, setSort] = useState("id");
  const [order, setOrder] = useState("desc");

  // Gültiges E‑Mail-Format? (nur Hinweis, keine Blockade)
  const emailFormatValid = (() => {
    const v = (form.email || "").trim();
    if (!v) return false;
    return /^\S+@\S+\.\S+$/.test(v);
  })();

  const qDebounced = useDebounce(q, 300); // ✅ debounce Suche

  async function load() {
    setLoading(true);
    setErr("");
    try {
      // NEU: Query-Params für serverseitige Suche & Sortierung
      const data = await Users.list({ q: qDebounced, sort, order, skip: 0, take: 50 });
      // Falls API _total mitschickt, kann man das hier lesen: data._total
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  // NEU: bei Suchbegriff/Sortierung neu laden
  useEffect(() => { load(); }, [qDebounced, sort, order]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "email" && emailError) setEmailError("");
  }

  function validate() {
    const { first_name, last_name, email } = form;
    if (!first_name.trim() || !last_name.trim() || !email.trim()) return "Alle Felder sind Pflicht.";
    if (first_name.trim().length < 2 || last_name.trim().length < 2) return "Vor- und Nachname min. 2 Zeichen.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Bitte eine gültige E-Mail angeben.";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    const v = validate();
    if (v) { setSnack({ open: true, message: v, type: "error" }); return; }

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim()
    };

    setSubmitting(true);
    try {
      if (editId) {
        await Users.update(editId, payload);
        setSnack({ open: true, message: "Änderung gespeichert.", type: "success" });
      } else {
        await Users.create(payload);
        setSnack({ open: true, message: "User angelegt.", type: "success" });
      }
      setForm({ first_name: "", last_name: "", email: "" });
      setEditId(null);
      await load();
    } catch (e) {
      const msg = e?.message || String(e);
      if (msg.toLowerCase().includes("email already exists") || msg.toLowerCase().includes("duplicate")) {
        setEmailError("E-Mail ist bereits vergeben.");
      }
      setSnack({ open: true, message: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  function requestDelete(user) {
    const label = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    const fallback = user?.name;
    const safe = label || (
      typeof fallback === "string"
        ? fallback
        : (fallback && typeof fallback === "object" && "name" in fallback)
          ? String(fallback.name)
          : String(fallback ?? "Unbenannt")
    );
    setConfirm({ open: true, id: user.id, name: safe });
  }

  async function confirmDelete() {
    if (!confirm.id) return;
    setErr("");
    try {
      await Users.remove(confirm.id);
      setSnack({ open: true, message: "Eintrag gelöscht.", type: "success" });
      await load();
    } catch (e) {
      setSnack({ open: true, message: e.message, type: "error" });
    } finally {
      setConfirm({ open: false, id: null, name: "" });
    }
  }

  // Server liefert bereits gefiltert → hier kein clientseitiges Filtern nötig
  const filtered = useMemo(() => list, [list]);

  const isEditing = editId != null;

  function toggleSort(col) {
    if (sort === col) {
      // gleiche Spalte → Richtung umschalten
      setOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      // neue Spalte → aufsteigend beginnen
      setSort(col);
      setOrder("asc");
    }
  }

  function caret(col) {
    if (sort !== col) return "";
    return order === "asc" ? " ↑" : " ↓";
  }

  return (
    <main className="app-container">
      <h1>Users</h1>

      {loading && <div className="loading">⏳ Lädt…</div>}

      {/* Suche */}
      <section className="search-section">
        <input
          placeholder="Suchen…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn-primary" onClick={load} disabled={loading || submitting}>Neu laden</button>
      </section>

      {/* Formular */}
      <form onSubmit={onSubmit} className="user-form">
        <input
          name="first_name"
          placeholder="Vorname"
          value={form.first_name}
          onChange={onChange}
          required
          minLength={2}
        />
        <input
          name="last_name"
          placeholder="Nachname"
          value={form.last_name}
          onChange={onChange}
          required
          minLength={2}
        />
        <input
          name="email"
          placeholder="E-Mail"
          type="email"
          value={form.email}
          onChange={onChange}
          required
          aria-invalid={Boolean(emailError)}
          className={emailError ? "input-invalid" : (emailFormatValid ? "input-valid" : "")}
        />
        {emailError ? (
          <div className="field-error">{emailError}</div>
        ) : (
          emailFormatValid && form.email.trim() ? <div className="field-hint">Format ok ✓</div> : null
        )}
        <button className="btn-primary" disabled={submitting}>
          {isEditing ? "Speichern" : "Anlegen"}
        </button>
      </form>

      {/* Liste */}
      {loading ? (
        <p style={{ marginTop: 12 }}>Lädt…</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>
                <button type="button" className="th-sort" onClick={() => toggleSort("id")}>
                  ID{caret("id")}
                </button>
              </th>
              <th style={{ textAlign: "left" }}>
                <button type="button" className="th-sort" onClick={() => toggleSort("first_name")}>
                  Vorname{caret("first_name")}
                </button>
              </th>
              <th style={{ textAlign: "left" }}>
                <button type="button" className="th-sort" onClick={() => toggleSort("last_name")}>
                  Nachname{caret("last_name")}
                </button>
              </th>
              <th style={{ textAlign: "left" }}>
                <button type="button" className="th-sort" onClick={() => toggleSort("email")}>
                  E-Mail{caret("email")}
                </button>
              </th>
              <th style={{ textAlign: "left" }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.first_name ?? ""}</td>
                <td>{u.last_name ?? ""}</td>
                <td>{u.email ?? ""}</td>
                <td className="actions">
                  <button
                    className="btn-primary"
                    onClick={() => { setEditId(u.id); setForm({ first_name: u.first_name ?? "", last_name: u.last_name ?? "", email: u.email ?? "" }); setEmailError(""); }}
                    disabled={submitting}
                  >
                    Bearb.
                  </button>{" "}
                  <button
                    className="btn-danger"
                    onClick={() => requestDelete(u)}
                    disabled={submitting}
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="no-entries">Keine Einträge</td></tr>
            )}
          </tbody>
        </table>
      )}

      {confirm.open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Eintrag löschen?</h3>
            <p>„{confirm.name}“ wird dauerhaft entfernt.</p>
            <div className="modal-actions">
              <button onClick={() => setConfirm({ open: false, id: null, name: "" })}>Abbrechen</button>
              <button className="btn-danger" onClick={confirmDelete}>Löschen</button>
            </div>
          </div>
        </div>
      )}

      <Snackbar
        open={snack.open}
        message={snack.message}
        type={snack.type}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        duration={1800}
      />
    </main>
  );
}
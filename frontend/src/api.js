// frontend/src/api.js

// Base URL for the backend (can be overridden via REACT_APP_API_URL)
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

async function api(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    // avoid accidental caching in some dev setups
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });

  const isNoContent = res.status === 204;
  let data = null;
  try {
    data = isNoContent ? null : await res.json();
  } catch (_) {
    data = null; // non-JSON error bodies
  }

  if (!res.ok) {
    const msg = (data && data.message) || res.statusText || "Request failed";
    throw new Error(msg);
  }

  return { data, res };
}

// List with optional query params (q, sort, order, skip, take)
async function list(opts = {}) {
  const p = new URLSearchParams();
  if (opts.q) p.set("q", String(opts.q));
  if (opts.sort) p.set("sort", String(opts.sort));
  if (opts.order) p.set("order", String(opts.order).toLowerCase() === "asc" ? "asc" : "desc");
  if (opts.skip != null) p.set("skip", String(opts.skip));
  if (opts.take != null) p.set("take", String(opts.take));

  const qs = p.toString();
  const { data, res } = await api(`/users${qs ? `?${qs}` : ""}`);

  const totalHeader = res.headers.get("X-Total-Count");
  const total = totalHeader != null ? Number(totalHeader) : undefined;

  const arr = Array.isArray(data) ? data : [];
  // attach non-enumerable metadata for optional pagination usage
  Object.defineProperty(arr, "_total", { value: total, enumerable: false });
  return arr;
}

const create = (payload) => api("/users", { method: "POST", body: JSON.stringify(payload) }).then(r => r.data);
const update = (id, payload) => api(`/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }).then(r => r.data);
const remove = (id) => api(`/users/${id}`, { method: "DELETE" }).then(r => r.data);

export const Users = { list, create, update, remove };
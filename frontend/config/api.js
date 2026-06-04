// Central API base URL.
//
// - In local dev, Vite proxies "/api" to the Express server (see vite.config.js),
//   so the default empty string ("" => same origin) just works.
// - In production on Vercel, the backend lives at /api on the same domain, so
//   same-origin is also correct.
// - To point at a backend on a different host, set VITE_API_URL in the
//   environment (e.g. https://my-backend.example.com) — no trailing slash.
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export default API_BASE_URL;

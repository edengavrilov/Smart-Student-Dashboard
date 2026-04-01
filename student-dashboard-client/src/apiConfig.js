const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_BASE = isLocalhost
  ? "https://localhost:7137/api"
  : "https://student-dashboard-api-iryi.onrender.com/api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const CSRF_HEADER = "x-csrf-token";
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const csrfExemptPaths = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/csrf",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email"
]);

let csrfToken = "";
let csrfTokenPromise = null;

async function getCsrfToken() {
  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${API_URL}/auth/csrf`, {
      method: "GET",
      credentials: "include"
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.csrfToken) {
          throw new Error(data.message ?? "Unable to initialize security token");
        }
        csrfToken = data.csrfToken;
        return csrfToken;
      })
      .finally(() => {
        csrfTokenPromise = null;
      });
  }

  return csrfTokenPromise;
}

function needsCsrf(path, method) {
  return unsafeMethods.has(method.toUpperCase()) && !csrfExemptPaths.has(path);
}

export async function apiRequest(path, options = {}) {
  const method = (options.method ?? "GET").toUpperCase();
  const csrfHeader = needsCsrf(path, method) ? { [CSRF_HEADER]: await getCsrfToken() } : {};
  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeader,
      ...(options.headers ?? {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 204) {
    if (path === "/auth/logout") {
      csrfToken = "";
    }
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
  }

  return data;
}

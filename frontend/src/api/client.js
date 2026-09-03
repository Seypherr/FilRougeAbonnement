const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:4000/api" : "/api");
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

export function getFriendlyApiError(message, status, path = "") {
  if (status === 401) {
    if (path === "/auth/login") {
      return "Adresse e-mail ou mot de passe incorrect.";
    }

    return "Votre session a expire. Connectez-vous a nouveau.";
  }

  if (status === 403) {
    return "Cette action n'est pas autorisee.";
  }

  if (status === 404) {
    return "La ressource demandee est introuvable.";
  }

  if (status === 429) {
    return "Trop de tentatives. Reessayez dans quelques minutes.";
  }

  if (status >= 500 || /prisma|datasource|database|postgres|connection/i.test(message ?? "")) {
    return "Le service rencontre un probleme temporaire. Reessayez dans quelques instants.";
  }

  return message || "Une erreur est survenue. Reessayez.";
}

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
          throw new Error(getFriendlyApiError(data.message, response.status, "/auth/csrf"));
        }
        csrfToken = data.csrfToken;
        return csrfToken;
      })
      .catch((error) => {
        if (error instanceof TypeError || /failed to fetch|networkerror/i.test(error.message ?? "")) {
          throw new Error("Impossible de joindre Frovely. Verifiez votre connexion puis reessayez.");
        }
        throw error;
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
  try {
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
      throw new Error(getFriendlyApiError(data.message, response.status, path));
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError || /failed to fetch|networkerror/i.test(error.message ?? "")) {
      throw new Error("Impossible de joindre Frovely. Verifiez votre connexion puis reessayez.");
    }

    throw error;
  }
}

export async function uploadAvatarFile(file) {
  const response = await fetch(`${API_URL}/auth/me/avatar`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": file.type,
      [CSRF_HEADER]: await getCsrfToken()
    },
    body: file
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getFriendlyApiError(data.message, response.status, "/auth/me/avatar"));
  }

  return data;
}

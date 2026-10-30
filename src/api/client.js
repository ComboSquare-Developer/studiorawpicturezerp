
const DEFAULT_API_URL =
  "https://studioraw-backend-2.onrender.com/api";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL
)
  .trim()
  .replace(/\/+$/, "");

// Cookie helper
export function getCookie(name) {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(value.join("="));
    }
  }

  return null;
}

let inMemoryCsrfToken = null;

// Normalize API endpoint
function getApiUrl(endpoint = "") {
  let cleanEndpoint = String(endpoint).trim().replace(/^\/+/, "");

  // Avoid duplicate /api/api/
  if (cleanEndpoint.startsWith("api/")) {
    cleanEndpoint = cleanEndpoint.slice(4);
  }

  return cleanEndpoint
    ? `${API_BASE_URL}/${cleanEndpoint}`
    : `${API_BASE_URL}/`;
}

// Initialize CSRF
export async function initializeCSRF() {
  try {
    const response = await fetch(getApiUrl("csrf/"), {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `CSRF initialization failed (${response.status})`
      );
    }

    const data = await response.json();

    if (data?.csrfToken) {
      inMemoryCsrfToken = data.csrfToken;
    }

    return data;
  } catch (error) {
    console.error("CSRF initialization failed:", error);
    throw error;
  }
}

// Main API request
export async function apiRequest(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  const headers = {
    Accept: "application/json",
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers,
  };

  // CSRF protection for write requests
  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
    let csrfToken =
      getCookie("csrftoken") || inMemoryCsrfToken;

    if (!csrfToken) {
      await initializeCSRF();

      csrfToken =
        getCookie("csrftoken") || inMemoryCsrfToken;
    }

    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }
  }

  const response = await fetch(getApiUrl(endpoint), {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;

    try {
      const contentType =
        response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const errorData = await response.json();

        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } else {
        errorMessage = await response.text();
      }
    } catch {
      // Keep original HTTP error
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

// Resource API creator
function createResourceApi(resourceName) {
  return {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();

      const url = query
        ? `${resourceName}/?${query}`
        : `${resourceName}/`;

      return apiRequest(url);
    },

    get: (id) =>
      apiRequest(`${resourceName}/${id}/`),

    create: (data) =>
      apiRequest(`${resourceName}/`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      apiRequest(`${resourceName}/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    put: (id, data) =>
      apiRequest(`${resourceName}/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id) =>
      apiRequest(`${resourceName}/${id}/`, {
        method: "DELETE",
      }),
  };
}

// All application APIs
export const api = {
  customers: createResourceApi("customers"),
  enquiries: createResourceApi("enquiries"),
  bookings: createResourceApi("bookings"),
  payments: createResourceApi("payments"),
  deliveries: createResourceApi("deliveries"),

  weddingPhotography: createResourceApi("wedding-photography"),
  weddingVideography: createResourceApi("wedding-videography"),
  functionsWeArrange: createResourceApi("functions-we-arrange"),
  eventManagement: createResourceApi("event-management"),
  customizedGifts: createResourceApi("customized-gifts"),

  inventory: createResourceApi("inventory"),
  equipment: createResourceApi("equipment"),
  expenses: createResourceApi("expenses"),
  staff: createResourceApi("staff"),
  branches: createResourceApi("branches"),

  notifications: {
    ...createResourceApi("notifications"),

    unreadCount: () =>
      apiRequest("notifications/unread-count/"),

    markRead: (id) =>
      apiRequest(`notifications/${id}/mark-read/`, {
        method: "POST",
      }),

    markAllRead: () =>
      apiRequest("notifications/mark-all-read/", {
        method: "POST",
      }),
  },

  reports: {
    summary: (params = {}) => {
      const query = new URLSearchParams(params).toString();

      const url = query
        ? `reports/summary/?${query}`
        : "reports/summary/";

      return apiRequest(url);
    },

    exportCsvUrl: (type = "summary") =>
      `${getApiUrl("reports/export-csv/")}?type=${encodeURIComponent(type)}`,
  },

  settings: {
    get: () =>
      apiRequest("settings/"),

    update: (data) =>
      apiRequest("settings/", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  dashboard: {
    stats: () =>
      apiRequest("dashboard/stats/"),
  },

  auth: {
    me: () =>
      apiRequest("auth/me/"),

    login: (credentials) =>
      apiRequest("login/", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    logout: () =>
      apiRequest("logout/", {
        method: "POST",
      }),

    updateProfile: (data) =>
      apiRequest("auth/profile/", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    changePassword: (data) =>
      apiRequest("auth/change-password/", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    forgotPassword: (data) =>
      apiRequest("auth/forgot-password/", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    resetPassword: (data) =>
      apiRequest("auth/reset-password/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};

export default API_BASE_URL;

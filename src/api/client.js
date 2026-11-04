
const DEFAULT_API_URL =
  "https://studioraw-backend-2.onrender.com/api";
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL
)
  .trim()
  .replace(/\/+$/, "");

// CSRF token received from the backend
let inMemoryCsrfToken = null;

// Normalize API endpoint
function getApiUrl(endpoint = "") {
  let cleanEndpoint = String(endpoint)
    .trim()
    .replace(/^\/+/, "");

  // Avoid duplicate /api/api/
  if (cleanEndpoint.startsWith("api/")) {
    cleanEndpoint = cleanEndpoint.slice(4);
  }

  return cleanEndpoint
    ? `${API_BASE_URL}/${cleanEndpoint}`
    : `${API_BASE_URL}/`;
}

// Get CSRF token from Django backend
export async function initializeCSRF() {
  try {
    const response = await fetch(getApiUrl("csrf/"), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
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

    if (!data?.csrfToken) {
      throw new Error(
        "CSRF token was not returned by the backend."
      );
    }

    inMemoryCsrfToken = data.csrfToken;

    return data;
  } catch (error) {
    console.error("CSRF initialization failed:", error);
    throw error;
  }
}

// Main API request
export async function apiRequest(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  const isWriteRequest = ![
    "GET",
    "HEAD",
    "OPTIONS",
    "TRACE",
  ].includes(method);

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = {
    Accept: "application/json",
    ...(options.body && !isFormData
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers,
  };

  // Always obtain a fresh backend CSRF token for write requests.
  if (isWriteRequest) {
    const csrfData = await initializeCSRF();

    const csrfToken =
      csrfData?.csrfToken || inMemoryCsrfToken;

    if (!csrfToken) {
      throw new Error("Unable to obtain Django CSRF token.");
    }

    headers["X-CSRFToken"] = csrfToken;
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
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(", ");
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } else {
        const text = await response.text();

        if (text) {
          errorMessage = text;
        }
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

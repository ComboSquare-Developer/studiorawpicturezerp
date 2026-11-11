/**
 * Studio Raw ERP - API Client (Frontend-Only Demo Mode)
 *
 * Disconnects live network connectivity to the Django backend and routes all
 * API operations through the local demo data and authentication services.
 *
 * Preserves the exact API signatures (api.*, apiRequest, initializeCSRF)
 * so existing pages, hooks, and components continue to function seamlessly.
 */

import { demoDataService } from "../services/demo/demoDataService";
import { demoAuthService } from "../services/demo/demoAuthService";
import { APP_MODE } from "../config/appMode";

export const API_BASE_URL = "demo://studio-raw-erp";

// In-memory demo CSRF token
let inMemoryCsrfToken = "demo-csrf-token-studio-raw-erp";

/**
 * Demo CSRF initialization (offline synchronous fulfillment)
 */
export async function initializeCSRF() {
  inMemoryCsrfToken = "demo-csrf-token-studio-raw-erp";
  return {
    csrfToken: inMemoryCsrfToken,
    demoMode: true,
  };
}

/**
 * Route URL path requests to the local demo service
 */
export async function apiRequest(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const rawBody = options.body;
  let body = {};

  if (rawBody) {
    if (typeof rawBody === "string") {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = rawBody;
      }
    } else {
      body = rawBody;
    }
  }

  // Normalize endpoint string
  let cleanEndpoint = String(endpoint || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  if (cleanEndpoint.startsWith("api/")) {
    cleanEndpoint = cleanEndpoint.slice(4);
  }

  const [path, queryString] = cleanEndpoint.split("?");
  const queryParams = Object.fromEntries(
    new URLSearchParams(queryString || "").entries()
  );

  // 1. CSRF
  if (path === "csrf" || path === "csrf/") {
    return initializeCSRF();
  }

  // 2. Authentication endpoints
  if (path === "login" || path === "login/") {
    return demoAuthService.login(body);
  }

  if (path === "logout" || path === "logout/") {
    return demoAuthService.logout();
  }

  if (path === "auth/me" || path === "auth/me/") {
    if (!demoAuthService.isAuthenticated()) {
      throw new Error("401 Unauthorized: Demo session not active");
    }
    return demoAuthService.getCurrentUser();
  }

  if (path === "auth/profile" || path === "auth/profile/") {
    return demoAuthService.updateProfile(body);
  }

  if (path === "auth/change-password" || path === "auth/change-password/") {
    return demoAuthService.changePassword(body);
  }

  if (path === "auth/forgot-password" || path === "auth/forgot-password/") {
    return demoAuthService.forgotPassword(body);
  }

  if (path === "auth/reset-password" || path === "auth/reset-password/") {
    return demoAuthService.resetPassword(body);
  }

  // 3. Dashboard stats
  if (path === "dashboard/stats" || path === "dashboard/stats/") {
    return demoDataService.dashboard.stats();
  }

  // 4. Reports summary
  if (path === "reports/summary" || path === "reports/summary/") {
    return demoDataService.reports.summary(queryParams);
  }

  // 5. Notifications helpers
  if (path === "notifications/unread-count" || path === "notifications/unread-count/") {
    return demoDataService.notifications.unreadCount();
  }

  if (path === "notifications/mark-all-read" || path === "notifications/mark-all-read/") {
    return demoDataService.notifications.markAllRead();
  }

  const markReadMatch = path.match(/^notifications\/([^/]+)\/mark-read$/);
  if (markReadMatch) {
    return demoDataService.notifications.markRead(markReadMatch[1]);
  }

  // 6. Settings
  if (path === "settings" || path === "settings/") {
    if (method === "GET") {
      return demoDataService.settings.get();
    }
    return demoDataService.settings.update(body);
  }

  // 7. General resource routing
  const resourceMap = {
    customers: demoDataService.customers,
    enquiries: demoDataService.enquiries,
    bookings: demoDataService.bookings,
    payments: demoDataService.payments,
    deliveries: demoDataService.deliveries,
    "wedding-photography": demoDataService.weddingPhotography,
    "wedding-videography": demoDataService.weddingVideography,
    "functions-we-arrange": demoDataService.functionsWeArrange,
    "event-management": demoDataService.eventManagement,
    "customized-gifts": demoDataService.customizedGifts,
    inventory: demoDataService.inventory,
    equipment: demoDataService.equipment,
    expenses: demoDataService.expenses,
    staff: demoDataService.staff,
    branches: demoDataService.branches,
    notifications: demoDataService.notifications,
  };

  const segments = path.split("/");
  const resourceKey = segments[0];
  const service = resourceMap[resourceKey];

  if (service) {
    const recordId = segments[1];

    if (method === "GET") {
      if (recordId) {
        return service.get(recordId);
      }
      return service.list(queryParams);
    }

    if (method === "POST") {
      return service.create(body);
    }

    if (method === "PATCH" || method === "PUT") {
      if (recordId) {
        return service.update(recordId, body);
      }
      return service.create(body);
    }

    if (method === "DELETE") {
      if (recordId) {
        return service.delete(recordId);
      }
      return { success: true };
    }
  }

  // Fallback for any unknown demo endpoint
  console.info(`[Demo Mode] Simulated fulfillment for endpoint: ${cleanEndpoint}`);
  return { success: true, demoMode: true };
}

/**
 * Main application API object
 */
export const api = {
  customers: demoDataService.customers,
  enquiries: demoDataService.enquiries,
  bookings: demoDataService.bookings,
  payments: demoDataService.payments,
  deliveries: demoDataService.deliveries,

  weddingPhotography: demoDataService.weddingPhotography,
  weddingVideography: demoDataService.weddingVideography,
  functionsWeArrange: demoDataService.functionsWeArrange,
  eventManagement: demoDataService.eventManagement,
  customizedGifts: demoDataService.customizedGifts,

  inventory: demoDataService.inventory,
  equipment: demoDataService.equipment,
  expenses: demoDataService.expenses,
  staff: demoDataService.staff,
  branches: demoDataService.branches,

  notifications: demoDataService.notifications,
  reports: demoDataService.reports,
  settings: demoDataService.settings,
  dashboard: demoDataService.dashboard,

  auth: {
    me: () => demoAuthService.getCurrentUser(),
    login: (credentials) => demoAuthService.login(credentials),
    logout: () => demoAuthService.logout(),
    updateProfile: (data) => demoAuthService.updateProfile(data),
    changePassword: (data) => demoAuthService.changePassword(data),
    forgotPassword: (data) => demoAuthService.forgotPassword(data),
    resetPassword: (data) => demoAuthService.resetPassword(data),
  },
};

export default API_BASE_URL;

/**
 * Studio Raw ERP - Application Mode Configuration
 *
 * Configures the ERP frontend to run in independent Frontend-Only Demo Mode.
 * In this mode, all backend dependencies (Django, database, live API calls)
 * are completely disconnected and replaced with a local demo service layer.
 */

export const APP_MODE = {
  // Flag indicating frontend-only demo mode
  DEMO: true,

  // Offline operation without backend server
  OFFLINE: true,

  // Backend API calls disabled
  BACKEND_ENABLED: false,

  // Application metadata
  APP_NAME: "Studio Raw Picturez ERP & CRM",
  VERSION: "2.0.0-demo",
  ENVIRONMENT: "demo",

  // Demo user credentials
  DEMO_CREDENTIALS: {
    username: "prathi",
    password: "prathi",
    role: "Administrator",
    name: "Admin",
    email: "admin@studiorawpicturez.com",
  },
};

export default APP_MODE;

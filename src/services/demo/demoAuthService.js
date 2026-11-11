/**
 * Studio Raw ERP - Demo Authentication Service
 *
 * Provides a frontend-only local demo authentication layer.
 * Manages user sessions, credentials verification, profile updates,
 * and password recovery via localStorage without contacting Django.
 *
 * DEMO CREDENTIALS:
 * Username: prathi  |  Password: prathi
 * Username: admin   |  Password: admin
 */

// Studio Raw ERP - Demo Authentication Service

const AUTH_STORAGE_KEY = "studioraw_logged_in";
const USER_STORAGE_KEY = "studioraw_user";
const PROFILE_KEY = "studioraw_admin_profile";

const DEFAULT_DEMO_USER = {
  id: 1,
  username: "prathi",
  name: "Admin",
  first_name: "Admin",
  last_name: "",
  role: "Administrator",
  email: "admin@studiorawpicturez.com",
  is_superuser: true,
  is_staff: true,
};

export const demoAuthService = {
  /**
   * Check if a demo session is currently active
   */
  isAuthenticated() {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  },

  /**
   * Get the current logged-in demo user profile
   */
  getCurrentUser() {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const rawUser = localStorage.getItem(USER_STORAGE_KEY);
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        let name = parsed.name || DEFAULT_DEMO_USER.name;
        if (name === "Prathiksha (Admin)" || name === "Prathiksha") name = "Admin";
        return { ...parsed, name };
      }

      const rawProfile = localStorage.getItem(PROFILE_KEY);
      if (rawProfile) {
        const parsed = JSON.parse(rawProfile);
        let name = parsed.name || DEFAULT_DEMO_USER.name;
        if (name === "Prathiksha (Admin)" || name === "Prathiksha") name = "Admin";
        return {
          ...DEFAULT_DEMO_USER,
          name,
          email: parsed.email || DEFAULT_DEMO_USER.email,
          role: parsed.role || DEFAULT_DEMO_USER.role,
        };
      }
    } catch {
      // Fallback to default
    }

    return DEFAULT_DEMO_USER;
  },

  /**
   * Login with demo credentials
   */
  async login({ username = "", password = "" }) {
    const cleanUser = String(username || "").trim().toLowerCase();
    const cleanPass = String(password || "").trim();

    if (!cleanUser || !cleanPass) {
      throw new Error("Please enter your username and password.");
    }

    // Accept documented demo credentials:
    // 1) prathi / prathi
    // 2) admin / admin
    // 3) or any user in demo mode
    const isValidDemoCredential =
      (cleanUser === "prathi" && cleanPass === "prathi") ||
      (cleanUser === "admin" && cleanPass === "admin") ||
      (cleanPass.length >= 4);

    if (!isValidDemoCredential) {
      throw new Error("Invalid username or password.");
    }

    const user = {
      ...DEFAULT_DEMO_USER,
      username: cleanUser,
      name: "Admin",
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role,
        })
      );
    } catch (e) {
      console.warn("Storage warning during demo login:", e);
    }

    return {
      message: "Login successful",
      user,
    };
  },

  /**
   * Logout from the demo session
   */
  async logout() {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }

    return { message: "Logged out successfully" };
  },

  /**
   * Update admin profile
   */
  async updateProfile(data = {}) {
    const current = this.getCurrentUser();
    const updated = {
      ...current,
      ...data,
      name: data.name || current.name,
      email: data.email || current.email,
    };

    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({
          name: updated.name,
          email: updated.email,
          role: updated.role || current.role,
        })
      );

      window.dispatchEvent(
        new CustomEvent("studioraw:data-updated", {
          detail: { type: "profile", user: updated },
        })
      );
    } catch {
      // Ignore
    }

    return {
      message: "Profile updated successfully",
      user: updated,
    };
  },

  /**
   * Change password in demo mode
   */
  async changePassword({ _currentPassword, newPassword } = {}) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters long.");
    }

    return {
      success: true,
      message: "Password updated successfully in demo mode.",
    };
  },

  /**
   * Request password recovery in demo mode
   */
  async forgotPassword({ email = "" } = {}) {
    if (!email) {
      throw new Error("Please enter your email address.");
    }

    return {
      success: true,
      message: "Demo password reset link has been dispatched to your email.",
    };
  },

  /**
   * Reset password with token in demo mode
   */
  async resetPassword({ new_password } = {}) {
    if (!new_password || new_password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    return {
      success: true,
      message: "Password has been successfully reset. You can now log in.",
    };
  },
};

export default demoAuthService;

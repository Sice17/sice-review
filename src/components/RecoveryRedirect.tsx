"use client";

import { useEffect } from "react";

/**
 * Supabase sends password-reset users to the site root with a hash like
 * `#access_token=...&type=recovery`. This catches that on the landing page
 * and forwards them (hash intact) to the dedicated reset-password page.
 */
export function RecoveryRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      window.location.href = "/auth/reset-password" + hash;
    }
  }, []);

  return null;
}

/** Keep auth cookies for 7 days so users stay signed in between visits. */
export const supabaseCookieOptions = {
  maxAge: 60 * 60 * 24 * 7,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

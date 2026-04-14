/**
 * Admin Whitelist Configuration
 * Only users with these emails will be allowed to access the /admin routes.
 */
export const ADMIN_EMAILS = [
    "founder@fiinny.com", // Example - update with real founder email
    "admin@fiinny.com",
    "karanarjunpvt@gmail.com", // Likely founder based on project names
    "atanpure44542@gmail.com", // From Twitter OG tag
];

/**
 * Checks if a user email is in the admin whitelist.
 */
export const isAdmin = (email: string | null | undefined): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Public site URL (no trailing slash). Used for manufacturer → retailer invite links.
 * Example: https://app.example.com
 */
export function getPublicBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL?.trim() || "";
  return raw.replace(/\/$/, "");
}

/**
 * Retailer signup URL with invite (existing app shell: ?view=signup).
 */
export function buildSignupInviteUrl(inviteCode: string): string {
  const base = getPublicBaseUrl();
  const path = `/?view=signup&inviteCode=${encodeURIComponent(inviteCode.trim())}`;
  if (!base) {
    return path;
  }
  return `${base}${path}`;
}

export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildMailtoInviteUrl(params: {
  to: string;
  subject: string;
  body: string;
}): string {
  const q = new URLSearchParams({
    subject: params.subject,
    body: params.body,
  });
  return `mailto:${params.to}?${q.toString()}`;
}

export function buildInviteShareMessage(inviteLink: string): string {
  return `You're invited to join our network on KrishiDukan as a retailer.\n\nCreate your account using this link:\n${inviteLink}`;
}

"use client";

import { Check, Copy, X } from "lucide-react";
import { useState } from "react";

type InviteCardProps = {
  inviteCode: string;
  retailerEmail: string;
  onDismiss: () => void;
};

export function InviteCard({ inviteCode, retailerEmail, onDismiss }: InviteCardProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      role="status"
      className="relative rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-ambient md:p-5"
    >
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="pr-10 text-sm font-semibold text-primary">Invite created</p>
      <p className="mt-1 text-sm text-on-surface-variant">
        Share this code with <span className="font-medium text-on-surface">{retailerEmail}</span>
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <code className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-2.5 font-mono text-lg font-semibold tracking-wider text-on-surface">
          {inviteCode}
        </code>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-container"
        >
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
    </div>
  );
}

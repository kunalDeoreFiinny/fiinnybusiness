"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only init in browser, skip server + development if no key
    if (typeof window === "undefined") return;

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

    if (!key) {
      console.debug("[Analytics] PostHog key not set — skipping init.");
      return;
    }

    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only", // Only create profiles for signed-in users
      capture_pageview: false,            // We handle pageviews manually via PostHogPageView
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        maskAllInputs: true,              // Never record passwords / financial inputs
        maskInputFn: (text) => "*".repeat(text.length),
      },
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

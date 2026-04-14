"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";
import { useAuth } from "@/components/AuthProvider";

function PageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const { user } = useAuth?.() ?? { user: null };

  // Identify user on login
  useEffect(() => {
    if (!posthog) return;
    if (user?.uid) {
      posthog.identify(user.uid, {
        email: user.email ?? undefined,
        // Never pass financial data
      });
    }
  }, [user, posthog]);

  // Track pageviews on route change
  useEffect(() => {
    if (!pathname || !posthog) return;
    let url = window.origin + pathname;
    if (searchParams.toString()) url += `?${searchParams.toString()}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, posthog]);

  return null;
}

export default function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PageViewInner />
    </Suspense>
  );
}

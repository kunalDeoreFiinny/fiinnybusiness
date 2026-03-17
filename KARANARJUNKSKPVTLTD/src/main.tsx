import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react';
import App from './App.tsx'
import './index.css'
import './i18n';

// ✅ Sentry error tracking — initialise BEFORE React renders
// Set VITE_SENTRY_DSN in your .env to enable. No-op if DSN not set.
const sentryDsn = (import.meta as any).env?.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: (import.meta as any).env?.MODE || 'production',
    tracesSampleRate: 0.1,          // capture 10% of sessions for performance tracing
    replaysOnErrorSampleRate: 1.0,  // always replay when an error occurs
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

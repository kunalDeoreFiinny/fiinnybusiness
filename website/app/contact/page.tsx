import type { Metadata } from 'next';
import { LanguageProvider } from '@/app/i18n/LanguageContext';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: "Contact Fiinny — Support & Engineering Team",
  description: "Contact the Fiinny engineering team in Hyderabad. We respond to all support requests within 24 hours. Reach us at support@fiinny.com.",
  openGraph: {
    title: "Contact Fiinny — Support & Engineering Team",
    description: "Reach Fiinny support. We respond within 24 hours. Built in Hyderabad, Telangana.",
    url: "https://fiinny.com/contact",
  },
};

export default function ContactPage() {
  return <LanguageProvider><ContactPageClient /></LanguageProvider>;
}

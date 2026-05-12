"use client";

import { useState } from "react";
import { shopProfileMock } from "../_data/mock";

export function SettingsSections() {
  const [profile, setProfile] = useState(shopProfileMock);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-ambient md:p-5">
        <h2 className="text-base font-semibold text-on-surface">Shop profile</h2>
        <p className="mt-1 text-sm text-on-surface-variant">How your store appears to buyers</p>
        <div className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Shop name</span>
            <input
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={profile.shopName}
              onChange={(e) => setProfile((p) => ({ ...p, shopName: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Tagline</span>
            <input
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={profile.tagline}
              onChange={(e) => setProfile((p) => ({ ...p, tagline: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Owner / manager</span>
            <input
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={profile.owner}
              onChange={(e) => setProfile((p) => ({ ...p, owner: e.target.value }))}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-ambient md:p-5">
        <h2 className="text-base font-semibold text-on-surface">Contact details</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Phone, email, and messaging</p>
        <div className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Phone</span>
            <input
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Email</span>
            <input
              type="email"
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">WhatsApp</span>
            <input
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={profile.whatsapp}
              onChange={(e) => setProfile((p) => ({ ...p, whatsapp: e.target.value }))}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-ambient md:p-5 lg:col-span-2">
        <h2 className="text-base font-semibold text-on-surface">Address</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Shown on maps and invoices</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Line 1</span>
            <input
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={profile.addressLine1}
              onChange={(e) => setProfile((p) => ({ ...p, addressLine1: e.target.value }))}
            />
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Line 2</span>
            <input
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={profile.addressLine2}
              onChange={(e) => setProfile((p) => ({ ...p, addressLine2: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">City</span>
            <input
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={profile.city}
              onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">State</span>
            <input
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={profile.state}
              onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">PIN</span>
            <input
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={profile.pin}
              onChange={(e) => setProfile((p) => ({ ...p, pin: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">GSTIN</span>
            <input
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={profile.gstin}
              onChange={(e) => setProfile((p) => ({ ...p, gstin: e.target.value }))}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-ambient md:p-5 lg:col-span-2">
        <h2 className="text-base font-semibold text-on-surface">Business settings</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Hours, delivery, and payments</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Store hours</span>
            <input
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={profile.hours}
              onChange={(e) => setProfile((p) => ({ ...p, hours: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-on-surface">Delivery radius (km)</span>
            <input
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
              value={profile.deliveryRadiusKm}
              onChange={(e) => setProfile((p) => ({ ...p, deliveryRadiusKm: e.target.value }))}
            />
          </label>
          <div className="flex flex-col justify-end gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
              <input
                type="checkbox"
                checked={profile.codEnabled}
                onChange={(e) => setProfile((p) => ({ ...p, codEnabled: e.target.checked }))}
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              />
              Cash on delivery
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
              <input
                type="checkbox"
                checked={profile.onlinePayments}
                onChange={(e) => setProfile((p) => ({ ...p, onlinePayments: e.target.checked }))}
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              />
              Online payments
            </label>
          </div>
        </div>
        <p className="mt-4 text-xs text-on-surface-variant">
          Changes are local only (mock). Connect to your backend to persist.
        </p>
      </section>
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { doc, GeoPoint, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2, LocateFixed, MapPin, Save } from "lucide-react";
import { auth, db } from "../../firebase";
import { PageHeader } from "../_components/page-header";

type ProfileForm = {
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
};

type RetailerDoc = {
  role?: string;
  shopName?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  geo?: GeoPoint;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  onboardingType?: string;
  manufacturerId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  active?: boolean;
  subscriptionStatus?: string;
};

declare global {
  interface Window {
    google?: any;
  }
}

const initialForm: ProfileForm = {
  shopName: "",
  ownerName: "",
  phone: "",
  email: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
};

function extractAddressFields(place: any): Partial<ProfileForm> {
  const fields: Partial<ProfileForm> = {};
  const parts: any[] = place?.address_components || [];
  for (const part of parts) {
    const types: string[] = part.types || [];
    if (types.includes("locality")) fields.city = part.long_name;
    if (types.includes("administrative_area_level_1")) fields.state = part.long_name;
    if (types.includes("postal_code")) fields.pincode = part.long_name;
  }
  if (place?.formatted_address) fields.line1 = place.formatted_address;
  return fields;
}

export default function ProfilePage() {
  const [uid, setUid] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [geo, setGeo] = useState<GeoPoint | null>(null);
  const [createdAt, setCreatedAt] = useState<unknown>(null);
  const [onboardingType, setOnboardingType] = useState<string | null>(null);
  const [manufacturerId, setManufacturerId] = useState<string | null>(null);
  const [active, setActive] = useState<boolean>(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUid(null);
        setLoading(false);
        return;
      }

      setUid(user.uid);
      setLoading(true);
      setStatus(null);

      try {
        const ref = doc(db, "retailers", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as RetailerDoc;
          const parsedGeo =
            data.geo instanceof GeoPoint
              ? data.geo
              : data.location &&
                  typeof data.location.latitude === "number" &&
                  typeof data.location.longitude === "number"
                ? new GeoPoint(data.location.latitude, data.location.longitude)
                : null;

          setForm({
            shopName: data.shopName || "",
            ownerName: data.ownerName || "",
            phone: data.phone || "",
            email: data.email || user.email || "",
            line1: data.address?.line1 || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            pincode: data.address?.pincode || "",
          });
          setGeo(parsedGeo);
          setCreatedAt(data.createdAt || null);
          setOnboardingType(data.onboardingType || null);
          setManufacturerId(data.manufacturerId || null);
          setActive(typeof data.active === "boolean" ? data.active : true);
          setSubscriptionStatus(data.subscriptionStatus || "free");
        } else {
          setForm((prev) => ({ ...prev, email: user.email || prev.email }));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load profile.";
        setStatus({ type: "error", message });
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapsError("Google Maps key not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
      return;
    }

    const setupAutocomplete = () => {
      if (!window.google?.maps?.places || !addressInputRef.current) return;
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        fields: ["formatted_address", "geometry", "address_components"],
        types: ["geocode"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const nextFields = extractAddressFields(place);
        setForm((prev) => ({ ...prev, ...nextFields }));
        const lat = place?.geometry?.location?.lat?.();
        const lng = place?.geometry?.location?.lng?.();
        if (typeof lat === "number" && typeof lng === "number") {
          setGeo(new GeoPoint(lat, lng));
        }
      });
    };

    if (window.google?.maps?.places) {
      setupAutocomplete();
      return;
    }

    const scriptId = "google-maps-places-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setupAutocomplete();
      script.onerror = () => setMapsError("Unable to load Google Maps Places.");
      document.head.appendChild(script);
    } else if (script.dataset.loaded === "true") {
      setupAutocomplete();
    } else {
      script.addEventListener("load", setupAutocomplete, { once: true });
    }

    script.onload = () => {
      script!.dataset.loaded = "true";
      setupAutocomplete();
    };
  }, []);

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setStatus({ type: "error", message: "Geolocation is not supported in this browser." });
      return;
    }

    setLocating(true);
    setStatus(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGeo(new GeoPoint(lat, lng));

        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any, geoStatus: string) => {
            if (geoStatus === "OK" && results?.[0]) {
              const parsed = extractAddressFields(results[0]);
              setForm((prev) => ({ ...prev, ...parsed }));
            }
          });
        }
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        setStatus({ type: "error", message: error.message || "Unable to access current location." });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const mapUrl = useMemo(() => {
    if (!geo) return "";
    return `https://maps.google.com/maps?q=${geo.latitude},${geo.longitude}&z=15&output=embed`;
  }, [geo]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uid) {
      setStatus({ type: "error", message: "Please sign in to manage your retailer profile." });
      return;
    }
    if (!geo) {
      setStatus({ type: "error", message: "Please select an address from autocomplete or use current location." });
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      await setDoc(
        doc(db, "retailers", uid),
        {
          role: "retailer",
          shopName: form.shopName.trim(),
          ownerName: form.ownerName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: {
            line1: form.line1.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
          },
          geo,
          onboardingType: onboardingType || "dashboard",
          manufacturerId: manufacturerId || null,
          createdAt: createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
          active,
          subscriptionStatus,
        },
        { merge: true },
      );

      setStatus({ type: "success", message: "Retailer profile saved successfully." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save retailer profile.";
      setStatus({ type: "error", message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your retailer profile, address, and mapped location."
      />

      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-ambient md:p-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading retailer profile...
          </div>
        ) : !uid ? (
          <p className="text-sm text-red-600">You must be signed in to access this page.</p>
        ) : (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-on-surface">Shop Name</span>
              <input
                required
                value={form.shopName}
                onChange={(e) => setForm((p) => ({ ...p, shopName: e.target.value }))}
                className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
                placeholder="Your shop name"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-on-surface">Owner Name</span>
              <input
                required
                value={form.ownerName}
                onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))}
                className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
                placeholder="Owner / manager name"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-on-surface">Retailer Phone Number</span>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
                placeholder="+91..."
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-on-surface">Retailer Email</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
                placeholder="email@example.com"
              />
            </label>

            <label className="md:col-span-2 flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-on-surface">Address Line</span>
              <input
                ref={addressInputRef}
                required
                value={form.line1}
                onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))}
                className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
                placeholder="Start typing and select an address"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-on-surface">City</span>
              <input
                required
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
                placeholder="City"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-on-surface">State</span>
              <input
                required
                value={form.state}
                onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
                placeholder="State"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-on-surface">Pincode</span>
              <input
                required
                value={form.pincode}
                onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))}
                className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
                placeholder="6-digit pincode"
              />
            </label>

            <div className="md:col-span-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-container disabled:opacity-70"
              >
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                Use Current Location
              </button>
              {mapsError ? <p className="text-xs text-harvest">{mapsError}</p> : null}
            </div>

            {geo ? (
              <div className="md:col-span-2 space-y-2">
                <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                  Location selected
                </div>
                <div className="overflow-hidden rounded-xl border border-outline-variant/30">
                  <iframe
                    title="Selected location preview"
                    src={mapUrl}
                    className="h-52 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            ) : null}

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        )}
      </section>

      {status ? (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
            status.type === "success"
              ? "border border-primary/30 bg-primary/10 text-primary"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {status.message}
        </div>
      ) : null}
    </>
  );
}
